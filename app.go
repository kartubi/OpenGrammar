package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// ClaudeResponse represents the response from Claude API
type ClaudeResponse struct {
	Content []struct {
		Text string `json:"text"`
		Type string `json:"type"`
	} `json:"content"`
	ID           string `json:"id"`
	Model        string `json:"model"`
	Role         string `json:"role"`
	StopReason   string `json:"stop_reason"`
	StopSequence string `json:"stop_sequence"`
	Type         string `json:"type"`
	Usage        struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
}

// ClaudeRequest represents the request to Claude API
type ClaudeRequest struct {
	Model     string `json:"model"`
	MaxTokens int    `json:"max_tokens"`
	Messages  []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ProcessText handles different types of text processing using Claude API
func (a *App) ProcessText(text string, apiKey string, actionType string, language string) (string, error) {
	if strings.TrimSpace(text) == "" {
		return "", fmt.Errorf("text cannot be empty")
	}

	if strings.TrimSpace(apiKey) == "" {
		return "", fmt.Errorf("API key is required")
	}

	// Generate language-specific instructions
	var languageInstruction string
	switch language {
	case "id":
		languageInstruction = "Please respond in Indonesian (Bahasa Indonesia). "
	case "en":
		languageInstruction = "Please respond in US English. "
	default:
		languageInstruction = "Please respond in US English. "
	}

	// Generate prompt based on action type and language
	var prompt string
	switch actionType {
	case "grammar":
		if language == "id" {
			prompt = fmt.Sprintf(`%sAnalisis teks berikut untuk masalah tata bahasa, ejaan, dan gaya penulisan.

Teks yang akan dianalisis:
"%s"

Harap berikan respons dalam format yang tepat ini:

ANALISIS:
[Daftar masalah tata bahasa, ejaan, dan gaya yang ditemukan. Jika tidak ada masalah, tulis "Tidak ada masalah yang terdeteksi."]

TEKS YANG DIPERBAIKI:
[Berikan versi teks yang telah diperbaiki dengan semua masalah diperbaiki]`, languageInstruction, text)
		} else {
			prompt = fmt.Sprintf(`%sAnalyze the following text for grammar, spelling, and style issues.

Text to analyze:
"%s"

Please respond in this exact format:

ANALYSIS:
[List specific grammar, spelling, and style issues found. If none found, write "No issues detected."]

CORRECTED TEXT:
[Provide the corrected version of the text with all issues fixed]`, languageInstruction, text)
		}

	case "improve":
		if language == "id" {
			prompt = fmt.Sprintf(`%sTingkatkan teks berikut dengan meningkatkan kejelasan, alur, dan kualitas secara keseluruhan sambil mempertahankan makna aslinya.

Teks asli:
"%s"

Harap berikan respons dalam format yang tepat ini:

PERBAIKAN YANG DILAKUKAN:
[Daftar perbaikan dan peningkatan spesifik yang dilakukan pada teks]

TEKS YANG DITINGKATKAN:
[Berikan versi teks yang telah ditingkatkan]`, languageInstruction, text)
		} else {
			prompt = fmt.Sprintf(`%sImprove the following text by enhancing clarity, flow, and overall quality while maintaining the original meaning.

Original text:
"%s"

Please respond in this exact format:

IMPROVEMENTS MADE:
[List the specific improvements and enhancements made to the text]

IMPROVED TEXT:
[Provide the enhanced version of the text]`, languageInstruction, text)
		}

	case "rephrase":
		if language == "id" {
			prompt = fmt.Sprintf(`%sParafrase teks berikut menggunakan kata-kata dan struktur kalimat yang berbeda sambil mempertahankan makna yang sama.

Teks asli:
"%s"

Harap berikan respons dalam format yang tepat ini:

CATATAN PARAFRASA:
[Penjelasan singkat tentang pendekatan parafrasa yang digunakan]

TEKS YANG DIPARAFRASA:
[Berikan versi teks yang telah diparafrasa]`, languageInstruction, text)
		} else {
			prompt = fmt.Sprintf(`%sRephrase the following text using different words and sentence structures while keeping the same meaning.

Original text:
"%s"

Please respond in this exact format:

REPHRASING NOTES:
[Brief explanation of the rephrasing approach used]

REPHRASED TEXT:
[Provide the rephrased version of the text]`, languageInstruction, text)
		}

	case "formal":
		if language == "id" {
			prompt = fmt.Sprintf(`%sTulis ulang teks berikut dengan nada yang lebih formal dan profesional yang cocok untuk konteks bisnis atau akademik.

Teks asli:
"%s"

Harap berikan respons dalam format yang tepat ini:

CATATAN FORMALISASI:
[Jelaskan perubahan apa yang dilakukan untuk membuat teks lebih formal]

TEKS FORMAL:
[Berikan versi formal dari teks]`, languageInstruction, text)
		} else {
			prompt = fmt.Sprintf(`%sRewrite the following text in a more formal, professional tone suitable for business or academic contexts.

Original text:
"%s"

Please respond in this exact format:

FORMALIZATION NOTES:
[Explain what changes were made to make the text more formal]

FORMAL TEXT:
[Provide the formal version of the text]`, languageInstruction, text)
		}

	case "detailed":
		if language == "id" {
			prompt = fmt.Sprintf(`%sKembangkan teks berikut dengan menambahkan lebih banyak detail, penjelasan, dan konteks sambil mempertahankan keakuratan.

Teks asli:
"%s"

Harap berikan respons dalam format yang tepat ini:

DETAIL PENGEMBANGAN:
[Jelaskan informasi dan detail tambahan apa yang ditambahkan]

TEKS YANG DIPERLUAS:
[Berikan versi teks yang diperluas dan lebih detail]`, languageInstruction, text)
		} else {
			prompt = fmt.Sprintf(`%sExpand the following text by adding more details, explanations, and context while maintaining accuracy.

Original text:
"%s"

Please respond in this exact format:

EXPANSION DETAILS:
[Explain what additional information and details were added]

DETAILED TEXT:
[Provide the expanded, more detailed version of the text]`, languageInstruction, text)
		}

	default:
		// Handle custom prompts - actionType is the custom prompt itself
		if language == "id" {
			prompt = fmt.Sprintf(`%sSilakan lakukan tindakan berikut pada teks yang diberikan:

Instruksi: %s

Teks yang akan diproses:
"%s"

Harap berikan respons dalam format yang tepat ini:

ANALISIS:
[Penjelasan singkat tentang tindakan yang dilakukan]

HASIL AKHIR:
[Berikan hasil akhir dari tindakan yang diminta]`, languageInstruction, actionType, text)
		} else {
			prompt = fmt.Sprintf(`%sPlease perform the following action on the given text:

Instruction: %s

Text to process:
"%s"

Please respond in this exact format:

ANALYSIS:
[Brief explanation of the action performed]

FINAL RESULT:
[Provide the final result of the requested action]`, languageInstruction, actionType, text)
		}
	}

	request := ClaudeRequest{
		Model:     "claude-3-haiku-20240307",
		MaxTokens: 1000,
		Messages: []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		}{
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	// Convert request to JSON
	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %v", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", "https://api.anthropic.com/v1/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading response: %v", err)
	}

	// Check for HTTP errors
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse the response
	var claudeResp ClaudeResponse
	if err := json.Unmarshal(body, &claudeResp); err != nil {
		return "", fmt.Errorf("error parsing response: %v", err)
	}

	// Extract the text from the response
	if len(claudeResp.Content) > 0 && claudeResp.Content[0].Type == "text" {
		return claudeResp.Content[0].Text, nil
	}

	return "", fmt.Errorf("unexpected response format")
}
