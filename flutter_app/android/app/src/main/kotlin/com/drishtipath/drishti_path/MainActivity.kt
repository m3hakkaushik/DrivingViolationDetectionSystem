package com.drishtipath.drishti_path

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel

class MainActivity : FlutterActivity() {
    private var speechRecognizer: SpeechRecognizer? = null
    private var eventSink: EventChannel.EventSink? = null
    private val CHANNEL = "drishti_path/voice_events"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        EventChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setStreamHandler(
            object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    eventSink = events
                    startListening()
                }

                override fun onCancel(arguments: Any?) {
                    eventSink = null
                    stopListening()
                }
            }
        )
    }

    private fun startListening() {
        if (SpeechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
            }
            
            speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {
                    // Always restart listening when speech pauses to keep continuous monitoring
                    speechRecognizer?.startListening(intent)
                }

                override fun onError(error: Int) {
                    Log.d("VoiceBridge", "Speech Recognition Error: $error")
                    // If the user hasn't spoken for a while, it throws an error (7). Restart it.
                    speechRecognizer?.startListening(intent)
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    checkMatches(matches)
                    // Loop immediately to keep listening
                    speechRecognizer?.startListening(intent)
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    checkMatches(matches)
                }

                override fun onEvent(eventType: Int, params: Bundle?) {}

                private fun checkMatches(matches: ArrayList<String>?) {
                    matches?.let {
                        if (it.any { text -> text.contains("mark", ignoreCase = true) }) {
                            Log.i("VoiceBridge", "Detected Voice Keyword: MARK")
                            eventSink?.success("mark")
                            
                            // Cancel and restart to flush the current phrase context
                            speechRecognizer?.cancel()
                            speechRecognizer?.startListening(intent)
                        }
                    }
                }
            })
            
            Log.i("VoiceBridge", "Starting SpeechRecognizer")
            speechRecognizer?.startListening(intent)
        } else {
            Log.e("VoiceBridge", "Speech Recognition not available")
            eventSink?.error("UNAVAILABLE", "Speech Recognition not available on this device", null)
        }
    }

    private fun stopListening() {
        Log.i("VoiceBridge", "Stopping SpeechRecognizer")
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
    }

    override fun onDestroy() {
        super.onDestroy()
        stopListening()
    }
}
