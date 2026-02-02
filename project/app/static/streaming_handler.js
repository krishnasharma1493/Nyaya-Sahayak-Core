/**
 * STREAMING RESPONSE HANDLER (Google Gemini Style)
 * Handles Server-Sent Events for instant, streaming text
 */

class StreamingResponseHandler {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.eventSource = null;
        this.onChunk = null;
        this.onComplete = null;
        this.onError = null;
        this.currentResponseText = '';
    }

    /**
     * Start streaming a query
     * @param {string} query - The user's legal query
     * @param {Function} onChunk - Callback for each text chunk (chunk) => {}
     * @param {Function} onComplete - Callback when complete (fullText, metadata) => {}
     * @param {Function} onError - Callback on error (error) => {}
     */
    async stream(query, onChunk, onComplete, onError) {
        this.onChunk = onChunk;
        this.onComplete = onComplete;
        this.onError = onError;
        this.currentResponseText = '';

        try {
            // Use Fetch API with streaming response
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Read the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });

                // Parse SSE format (data: {...}\n\n)
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            this._handleEvent(data);
                        } catch (e) {
                            console.warn('Failed to parse SSE data:', line, e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Streaming error:', error);
            if (this.onError) {
                this.onError(error.message);
            }
        }
    }

    /**
     * Handle incoming SSE events
     */
    _handleEvent(data) {
        switch (data.type) {
            case 'start':
                console.log('🎬 Stream started for query:', data.query);
                break;

            case 'chunk':
                // Append chunk to current response
                this.currentResponseText += data.text;

                // Call chunk callback
                if (this.onChunk) {
                    this.onChunk(data.text, this.currentResponseText);
                }
                break;

            case 'done':
                console.log('✅ Stream complete:', data.metadata);

                // Call completion callback
                if (this.onComplete) {
                    this.onComplete(this.currentResponseText, data.metadata);
                }
                break;

            case 'error':
                console.error('❌ Stream error:', data.message);

                // Call error callback
                if (this.onError) {
                    this.onError(data.message);
                }
                break;
        }
    }

    /**
     * Cancel the current stream
     */
    cancel() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}


/**
 * SUGGESTION CHIPS PARSER
 * Extracts and displays follow-up questions
 */

class SuggestionChipsHandler {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.suggestionsContainer = null;
        this.onSuggestionClick = null;
    }

    /**
     * Parse suggestions from response text
     * Looks for JSON: {"suggestions": ["Q1?", "Q2?", "Q3?"]}
     */
    extractSuggestions(responseText) {
        try {
            // Match JSON block with suggestions
            const jsonMatch = responseText.match(/```json\s*(\{[^`]+\})\s*```/);

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                    return parsed.suggestions;
                }
            }

            // Alternative: Look for naked JSON
            const nakedMatch = responseText.match(/\{"suggestions":\s*\[([^\]]+)\]\}/);
            if (nakedMatch) {
                const parsed = JSON.parse(`{"suggestions": [${nakedMatch[1]}]}`);
                return parsed.suggestions;
            }

            return [];
        } catch (e) {
            console.warn('Failed to parse suggestions:', e);
            return [];
        }
    }

    /**
     * Display suggestion chips
     * @param {Array<string>} suggestions - Array of suggestion strings
     * @param {Function} onClickCallback - Called when chip is clicked
     */
    display(suggestions, onClickCallback) {
        this.onSuggestionClick = onClickCallback;

        // Remove old suggestions if any
        if (this.suggestionsContainer) {
            this.suggestionsContainer.remove();
        }

        if (!suggestions || suggestions.length === 0) return;

        // Create suggestions container
        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.className = 'suggestion-chips-container';

        // Create label
        const label = document.createElement('div');
        label.className = 'suggestion-label';
        label.textContent = '💡 Follow-up questions:';
        this.suggestionsContainer.appendChild(label);

        // Create chips wrapper
        const chipsWrapper = document.createElement('div');
        chipsWrapper.className = 'suggestion-chips';

        // Create individual chips
        suggestions.forEach((suggestion, index) => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.dataset.suggestion = suggestion;

            // Add click handler
            chip.addEventListener('click', () => {
                if (this.onSuggestionClick) {
                    this.onSuggestionClick(suggestion);
                }
            });

            chipsWrapper.appendChild(chip);
        });

        this.suggestionsContainer.appendChild(chipsWrapper);

        // Append to container
        if (this.container) {
            this.container.appendChild(this.suggestionsContainer);

            // Scroll to show suggestions
            this.suggestionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Clear suggestions
     */
    clear() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.remove();
            this.suggestionsContainer = null;
        }
    }
}

// Export for global use
window.StreamingResponseHandler = StreamingResponseHandler;
window.SuggestionChipsHandler = SuggestionChipsHandler;
