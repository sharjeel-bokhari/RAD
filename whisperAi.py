import whisper

class Whisper:
    def __init__(self, model_name="base"):
        self.model = whisper.load_model(model_name)

    def transcribe_audio(self, audio_file):
        try:
            result = self.model.transcribe(audio_file)
            print(result["text"])
            return result["text"]
        except Exception as e:
            return f"Error: {str(e)}"