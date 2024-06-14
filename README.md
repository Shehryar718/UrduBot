# Urdu Bot

---

## Overview

Urdu Bot is an Urdu chatbot leveraging Llama3 through Ollama, featuring speech-to-text conversation capabilities. This anxiety therapist helps facilitate conversations in Urdu, providing support and assistance.

## Features

- Text input
- Speech input

## Directory Tree

```
├── app.py
├── audio_files
│   ├── 06-14-2024-19-22-10.wav
│   ├── 06-14-2024-19-22-19.wav
│   ├── ...
├── config.py
├── instance
│   └── <your database file>
├── models.py
├── requirements.txt
├── rough.ipynb
├── static
│   ├── js
│   │   └── app.js
│   └── styles.css
└── templates
    └── chat.html
```

## Usage

Tested on Python 3.10.

```bash
conda create -n <env_name> python==3.10
conda activate <env_name>
```

To use Urdu Bot, ensure you have requirements installed:

```bash
pip install -r requirements.txt
```
