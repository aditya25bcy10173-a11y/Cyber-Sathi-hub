Mal-Email Detector 🛡️

An Artificial Neural Network (ANN/MLP) based email classifier that detects malicious emails (spam and phishing) using NLP text preprocessing and TF-IDF feature extraction.

📌 Overview

This project builds a binary classifier to distinguish between safe (ham) and malicious (spam/phishing) emails. It uses a Multi-Layer Perceptron (ANN) trained on TF-IDF vectorized email text, combining multiple well-known public email datasets for broader coverage of attack types.

📊 Dataset

Source: Phishing Email Dataset (Kaggle) — "Phish No More"

This is a combined dataset merging six public email corpora:

Enron Spam Dataset Ling-Spam Dataset CEAS 2008 Spam Corpus Nazario Phishing Corpus Nigerian Fraud Emails SpamAssassin Public Corpus

File used: phishing_email.csv Columns: text_combined (email text), label (0 = safe/ham, 1 = malicious/phishing) Size after cleaning: ~80,726 emails (label 0: 38,010 | label 1: 42,716)

⚙️ Pipeline Data Loading — Load combined CSV, verify label balance Text Cleaning — Lowercase, remove URLs, remove digits, remove punctuation, normalize whitespace Duplicate Removal — Drop duplicates on (clean_text, label) pair (not on text alone, to avoid accidentally collapsing an entire class) Feature Extraction — TF-IDF vectorization (top 3,000 features) Train/Test Split — 80/20 split, stratified on label Model — ANN (Multi-Layer Perceptron) built with Keras Training — With EarlyStopping to prevent overfitting Evaluation — Accuracy, confusion matrix, precision/recall/F1 Inference — Tested on custom real-world example emails 🧠 Model Architecture Input(3000 features) ↓ Dense(128, activation='relu') ↓ Dropout(0.3) ↓ Dense(64, activation='relu') ↓ Dropout(0.3) ↓ Dense(1, activation='sigmoid') Optimizer: Adam Loss: Binary Crossentropy Regularization: Dropout (0.3) + EarlyStopping (patience=3, monitors val_loss, restores best weights) 📈 Results Metric Score Test Accuracy 98.45% Precision (Safe) 0.99 Recall (Safe) 0.98 Precision (Malicious) 0.98 Recall (Malicious) 0.99

Model was validated on custom, unseen example emails (lottery scams, phishing links, and genuine business emails) and correctly classified the clear-cut cases, with reasonable uncertainty on genuinely ambiguous borderline emails.

🗂️ Files File Description mal_email_detector.keras Trained ANN model tfidf_vectorizer.joblib Fitted TF-IDF vectorizer (required for inference — converts raw text to the same feature space the model was trained on) Untitled__1_.ipynb Full training notebook 🚀 How to Use the Saved Model python from tensorflow.keras.models import load_model import joblib import re, string

Load model and vectorizer
model = load_model("mal_email_detector.keras") tfidf = joblib.load("tfidf_vectorizer.joblib")

def clean_text(text): text = str(text).lower() text = re.sub(r'http\S+', '', text) text = re.sub(r'\d+', '', text) text = text.translate(str.maketrans('', '', string.punctuation)) text = re.sub(r'\s+', ' ', text).strip() return text

Predict on a new email
email = ["Your account has been suspended, click here to verify immediately"] clean = [clean_text(e) for e in email] vec = tfidf.transform(clean).toarray() prediction = model.predict(vec)

print("Malicious/Spam" if prediction[0][0] > 0.5 else "Safe/Ham") 🛠️ Requirements pandas numpy scikit-learn tensorflow matplotlib seaborn joblib ⚠️ Known Limitations Trained on English-language email text only TF-IDF loses word order and semantic context — struggles with genuinely ambiguous, short, generic business-style emails (e.g. invoice/payment requests) that share vocabulary with both legitimate and phishing emails Does not use metadata features (sender domain, headers, links, SPF records) — text content only Dataset skews toward older-style spam (Enron era); may not generalize to newer, more sophisticated phishing techniques without periodic retraining 🔮 Possible Future Improvements Add metadata/header-based features (sender domain reputation, number of links, urgency-keyword scoring) Try transformer-based models (DistilBERT) for better contextual understanding Expand to 3-class classification (Safe / Spam / Phishing) instead of binary Build a simple web demo (Flask/Streamlit) for live testing
