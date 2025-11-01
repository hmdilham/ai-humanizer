# AI Detector & Humanizer v2.0 — Advanced Heuristics

## 🎯 Fitur Utama

### Deteksi AI (Advanced)
- **Perplexity Analysis**: Mengukur prediktabilitas teks
- **Burstiness Score**: Variasi panjang kalimat (key indicator!)
- **Lexical Diversity**: Type-Token Ratio (TTR)
- **Syntactic Complexity**: Analisis struktur kalimat
- **Transition Overuse**: Deteksi kata transisi berlebihan
- **Punctuation Regularity**: Pola tanda baca terlalu konsisten
- **Semantic Coherence**: Koherensi antar paragraf
- **N-gram Predictability**: Deteksi pola umum AI

### Parafrasa Anti-Detection
- **Aggressive Restructuring**: Ubah struktur kalimat total
- **Burstiness Injection**: Variasi panjang kalimat ekstrem
- **Colloquial Language**: Bahasa informal & natural
- **Personal Voice**: Tambah perspektif personal
- **Filler Words**: "well", "basically", "you know", dll
- **Break AI Patterns**: Hindari pola formal AI
- **Optional Typos**: Simulasi typo ringan (humanizing)
- **Context-aware Synonyms**: Penggantian kata lebih cerdas

## 📋 Cara Pakai

1. Simpan semua file dalam 1 folder
2. Buka `index.html` di browser
3. Masukkan teks di panel kiri
4. Klik "Detect AI" untuk analisis mendalam
5. Klik "Humanize" untuk parafrasa anti-detection
6. (Opsional) Masukkan Google API Key untuk hasil terbaik

## 🔬 Tentang Deteksi

Algoritma ini meniru metode GPTZero dengan fokus pada:
- **Perplexity**: Teks AI cenderung low perplexity (predictable)
- **Burstiness**: Teks manusia punya variasi panjang kalimat tinggi

Score 0-100:
- 0-30: Very likely human
- 31-50: Possibly AI
- 51-70: Likely AI
- 71-100: Almost certainly AI

## ⚠️ Disclaimer

Ini adalah implementasi heuristik untuk tujuan edukasi. Untuk akurasi tinggi, gunakan model ML profesional seperti GPTZero, Originality.ai, atau detector berbasis transformer.

## 🔐 Keamanan

- API key hanya disimpan di browser session
- Untuk produksi: gunakan backend proxy
- Jangan commit API key ke repository publik

Lisensi: MIT