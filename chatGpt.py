import re
import numpy as np
from langchain_community.llms import OpenAI

class ScamDetector:
    def __init__(self, api_key):
        self.model = OpenAI(api_key= api_key)

    def get_prediction(self, text):
       
        prompt = [f"Is this scam sentence or not? Just answer '1' if scam or '0' if not scam only. Reply in integer 0 or 1: {text}"]
        response = self.model.generate(prompt)
        response_text = response.generations[0][0].text.strip()
        print('\n',response_text, "\n")
        match = re.search(r'\b[01]\b', response_text)
        if match:
            return int(match.group())
        else:
            return None