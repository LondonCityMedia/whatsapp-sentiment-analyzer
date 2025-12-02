import re
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from datetime import datetime
from dateutil.relativedelta import relativedelta
import emoji
from collections import Counter
import string
import unicodedata

class WhatsAppAnalyzer:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        # Basic English stopwords list + User defined stopwords
        self.stopwords = set([
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't",
            'omitted', 'media', 'image', 'video', 'sticker', 'gif',
            # User defined stopwords
            'laura', 'sean', 'mark', 'like', 'yeah', 'would', 'got', "it's", 'also', 'actually',
            'get', 'yes', 'well', 'really', 'know', 'dont', 'bit', 'thats', 'could', 'going', 'one', "mark's", 'see', 'lot',
            'say', 'said', 'thought', 'time', 'image', 'much', 'back', 'i\'m', 'hes', 'quite', 'sure', 'didnt', 'want', 'people', 'don\'t', 'thank', 'still',
            'probably', 'great', 'thanks', 'maybe', 'make', 'you\'re', 'that\'s', 'it\'s', 'mark\'s', 'she\'s', 'even', 'need', 'she\'s', 'still',
            'new', 'looks', 'I\'m', 'He\'s', 'say', 'first', 'last', 'Don\'t', 'Ive', 'I\'ll', 'though', 'this', 'This', 'didn\'t', 'He\'s',
            'Think', 'Ive', 'That', 'i\'ll', 'It\'s', 'it\'s', 'Think', 'right', 'come'
        ])
        
        # Normalize stopwords: lowercase and strip punctuation (including smart quotes)
        punctuation_map = str.maketrans('', '', string.punctuation + '’‘“”')
        self.stopwords = {
            word.translate(punctuation_map).lower()
            for word in self.stopwords
        }
        # Explicitly add common contractions without apostrophes
        self.stopwords.update(['im', 'hes', 'she', 'shes', 'its', 'dont', 'wont', 'cant', 'youre', 'theyre', 'weve', 'youve'])
        
        print(f"DEBUG: Stopwords count: {len(self.stopwords)}")
        print(f"DEBUG: Sample stopwords: {list(self.stopwords)[:10]}")
        if 'im' in self.stopwords: print("DEBUG: 'im' is in stopwords")
        if 'dont' in self.stopwords: print("DEBUG: 'dont' is in stopwords")

    def parse_chat(self, file_content: str):
        """
        Parses WhatsApp chat text content into a structured DataFrame.
        """
        pattern1 = r'^\[(\d{1,2}/\d{1,2}/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?)\]\s(.*?):\s(.*)$'
        pattern2 = r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s(.*?):\s(.*)$'

        data = []
        lines = file_content.split('\n')
        
        exclude_authors = {'you'}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Pre-filtering: Remove lines containing specific phrases (case-insensitive)
            line_lower = line.lower()
            if ('image omitted' in line_lower 
            or 'gif omitted' in line_lower
            # or 'and calls are end-to-end encrypted' in line_lower # Handled dynamically below
            or '\u200E\u200E' in line_lower # strip the double unicode character 
            or 'you started a video call' in line_lower):
                continue
            
            match1 = re.match(pattern1, line)
            match2 = re.match(pattern2, line)
            
            if match1:
                date, time, author, message = match1.groups()
                
                # Dynamic Exclusion: Check for encryption message
                if 'messages and calls are end-to-end encrypted' in message.lower():
                     # Strip invisible Unicode characters
                    author_clean = ''.join(c for c in author if unicodedata.category(c)[0] != 'C').strip().lower()
                    print(f"DEBUG: Found encryption message from '{author}'. Adding '{author_clean}' to exclude_authors.")
                    exclude_authors.add(author_clean)
                    continue

                # Strip invisible Unicode characters (like zero-width spaces, LTR marks, etc.)
                author_clean = ''.join(c for c in author if unicodedata.category(c)[0] != 'C').strip().lower()
                if author_clean in exclude_authors:
                    print(f"DEBUG: Filtered out author '{author}' (cleaned: '{author_clean}')")
                    continue
                data.append({'date': date, 'time': time, 'author': author, 'message': message})
            elif match2:
                date, time, author, message = match2.groups()

                # Dynamic Exclusion: Check for encryption message
                if 'messages and calls are end-to-end encrypted' in message.lower():
                     # Strip invisible Unicode characters
                    author_clean = ''.join(c for c in author if unicodedata.category(c)[0] != 'C').strip().lower()
                    print(f"DEBUG: Found encryption message from '{author}'. Adding '{author_clean}' to exclude_authors.")
                    exclude_authors.add(author_clean)
                    continue

                # Strip invisible Unicode characters
                author_clean = ''.join(c for c in author if unicodedata.category(c)[0] != 'C').strip().lower()
                if author_clean in exclude_authors:
                    print(f"DEBUG: Filtered out author '{author}' (cleaned: '{author_clean}')")
                    continue
                data.append({'date': date, 'time': time, 'author': author, 'message': message})
            else:
                if data:
                    data[-1]['message'] += f" {line}"

        df = pd.DataFrame(data)
        if not df.empty:
            df['datetime'] = pd.to_datetime(df['date'] + ' ' + df['time'], dayfirst=True, errors='coerce')
            df = df.dropna(subset=['datetime'])
            
            # Robust Filtering
            # 1. Strip whitespace and normalize
            df['author'] = df['author'].str.strip()
            
            # 2. Filter specific names (case insensitive) - AGGRESSIVE
            # (Moved to early filtering loop for efficiency and correctness)
            
            # 3. Filter system messages
            system_keywords = [
                ' changed the subject to',
                ' changed the group icon',
                ' added ',
                ' left',
                ' removed ',
                ' joined using this group\'s invite link',
                ' security code changed'
            ]
            for keyword in system_keywords:
                df = df[~df['author'].str.contains(keyword, case=False)]
        
        return df

    def analyze_sentiment(self, df: pd.DataFrame):
        if df.empty:
            return {}

        # Calculate sentiment scores
        df['sentiment_score'] = df['message'].apply(lambda x: self.analyzer.polarity_scores(str(x))['compound'])
        
        def categorize_sentiment(score):
            if score >= 0.05: return 'positive'
            elif score <= -0.05: return 'negative'
            else: return 'neutral'
        
        df['sentiment_category'] = df['sentiment_score'].apply(categorize_sentiment)
        
        # --- 1. Sentiment by Person & Message Length ---
        df['message_length'] = df['message'].apply(lambda x: len(str(x).split()))
        
        sentiment_by_person = df.groupby('author').agg({
            'sentiment_score': 'mean',
            'message': 'count',
            'message_length': 'mean'
        }).reset_index()
        
        sentiment_by_person = sentiment_by_person.rename(columns={
            'sentiment_score': 'average_sentiment', 
            'message': 'total_messages',
            'message_length': 'avg_message_length'
        })
        
        # Calculate distribution
        sentiment_dist = df.groupby(['author', 'sentiment_category']).size().unstack(fill_value=0).reset_index()
        sentiment_by_person = pd.merge(sentiment_by_person, sentiment_dist, on='author', how='left')
        
        for cat in ['positive', 'neutral', 'negative']:
            if cat not in sentiment_by_person.columns:
                sentiment_by_person[cat] = 0
            sentiment_by_person[f'{cat}_pct'] = (sentiment_by_person[cat] / sentiment_by_person['total_messages'] * 100)

        sentiment_by_person = sentiment_by_person.sort_values('average_sentiment', ascending=False)

        # --- 2. Hourly Activity (Per User) ---
        df['hour'] = df['datetime'].dt.hour
        
        # Group by hour AND author
        hourly_activity = df.groupby(['hour', 'author']).size().reset_index(name='count')
        
        # Pivot to have authors as columns
        hourly_activity_pivot = hourly_activity.pivot(index='hour', columns='author', values='count').fillna(0).reset_index()
        
        # Ensure all hours 0-23 are present
        all_hours = pd.DataFrame({'hour': range(24)})
        hourly_activity_final = pd.merge(all_hours, hourly_activity_pivot, on='hour', how='left').fillna(0)
        
        # Convert to list of dicts
        hourly_activity_data = hourly_activity_final.to_dict(orient='records')

        # --- 3. Response Time Analysis ---
        df_sorted = df.sort_values('datetime')
        df_sorted['prev_datetime'] = df_sorted['datetime'].shift(1)
        df_sorted['prev_author'] = df_sorted['author'].shift(1)
        
        # Calculate time difference in minutes
        df_sorted['time_diff'] = (df_sorted['datetime'] - df_sorted['prev_datetime']).dt.total_seconds() / 60
        
        # Filter: only consider it a "response" if previous author was different
        # Also filter out very long gaps (e.g. > 12 hours) as that's likely a new conversation, not a response
        response_times = df_sorted[
            (df_sorted['author'] != df_sorted['prev_author']) & 
            (df_sorted['prev_author'].notna()) &
            (df_sorted['time_diff'] <= 720) # 12 hours
        ]
        
        avg_response_times = response_times.groupby('author')['time_diff'].mean().reset_index()
        avg_response_times.columns = ['author', 'avg_response_time_minutes']
        avg_response_times = avg_response_times.sort_values('avg_response_time_minutes')
        
        # Merge response times into sentiment_by_person for easier frontend handling
        sentiment_by_person = pd.merge(sentiment_by_person, avg_response_times, on='author', how='left').fillna(0)

        # --- 3.5 Conversation Initiation Analysis ---
        # Define conversation start as first message after 3+ hours of silence
        conversation_gap_hours = 3
        df_sorted['is_conversation_start'] = df_sorted['time_diff'] > (conversation_gap_hours * 60)
        
        # Count conversation initiations per author
        conversation_starts = df_sorted[df_sorted['is_conversation_start'] == True].groupby('author').size().reset_index(name='conversations_started')
        
        # Calculate total conversations
        total_conversations = conversation_starts['conversations_started'].sum()
        
        # Calculate percentage for each author
        if total_conversations > 0:
            conversation_starts['initiation_percentage'] = (conversation_starts['conversations_started'] / total_conversations * 100).round(1)
        else:
            conversation_starts['initiation_percentage'] = 0
        conversation_starts = conversation_starts.sort_values('conversations_started', ascending=False)

        # --- 4. Emoji Analysis ---
        def extract_emojis(text):
            return [c for c in text if c in emoji.EMOJI_DATA]

        all_emojis = []
        user_emojis = {}

        for _, row in df.iterrows():
            emojis = extract_emojis(row['message'])
            all_emojis.extend(emojis)
            
            # For user emojis
            if row['author'] not in user_emojis:
                user_emojis[row['author']] = []
            user_emojis[row['author']].extend(emojis)

        # User Top Emojis
        user_emoji_stats = []
        for author, emojis in user_emojis.items():
            if emojis:
                top = Counter(emojis).most_common(5)
                user_emoji_stats.append({
                    "author": author,
                    "top_emojis": [{"emoji": e, "count": c} for e, c in top]
                })

        # --- 5. Word Cloud / Frequency ---
        def get_tokens(text):
            # Remove punctuation (including smart quotes) and convert to lower case
            punctuation_map = str.maketrans('', '', string.punctuation + '“”')
            text = text.translate(punctuation_map).lower()
            tokens = text.split()
            filtered = [t for t in tokens if t not in self.stopwords and len(t) > 2]
            
            # Debugging sample
            if len(tokens) > 0 and len(filtered) < len(tokens):
                 removed = set(tokens) - set(filtered)
                 # print(f"DEBUG: Removed words: {list(removed)[:5]}")
            
            return filtered

        user_word_freq = []
        for author in df['author'].unique():
            author_msgs = df[df['author'] == author]['message'].str.cat(sep=' ')
            tokens = get_tokens(author_msgs)
            common_words = Counter(tokens).most_common(30)
            user_word_freq.append({
                "author": author,
                "words": [{"text": word, "value": count} for word, count in common_words]
            })

        # --- 6. Domain Extraction (Per User) ---
        url_pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+'
        
        def normalize_domain(domain: str) -> str:
            """
            Normalizes domains so related hosts are grouped together.
            Currently consolidates YouTube variants (youtube.com / youtu.be).
            """
            d = domain.lower()
            if d in {"youtu.be", "youtube.com", "www.youtube.com"}:
                return "youtube.com"
            return d

        def extract_domain(text):
            urls = re.findall(url_pattern, text)
            domains = []
            for url in urls:
                try:
                    from urllib.parse import urlparse
                    domain = urlparse(url).netloc
                    # Strip port if present and normalize www + case
                    if ':' in domain:
                        domain = domain.split(':', 1)[0]
                    if domain.startswith('www.'):
                        domain = domain[4:]
                    domains.append(normalize_domain(domain))
                except:
                    pass
            return domains

        user_domain_stats = []
        for author in df['author'].unique():
            author_msgs = df[df['author'] == author]['message']
            author_domains = []
            for msg in author_msgs:
                author_domains.extend(extract_domain(msg))
            
            if author_domains:
                top = Counter(author_domains).most_common(5)
                user_domain_stats.append({
                    "author": author,
                    "domains": [{"domain": d, "count": c} for d, c in top]
                })

        # --- 7. Total Duration ---
        total_duration = "N/A"
        if not df.empty:
            min_date = df['datetime'].min()
            max_date = df['datetime'].max()
            diff = relativedelta(max_date, min_date)
            
            parts = []
            if diff.years > 0:
                parts.append(f"{diff.years} year{'s' if diff.years != 1 else ''}")
            if diff.months > 0:
                parts.append(f"{diff.months} month{'s' if diff.months != 1 else ''}")
            
            if not parts:
                # Less than a month
                if diff.days > 0:
                    parts.append(f"{diff.days} day{'s' if diff.days != 1 else ''}")
                else:
                    parts.append("Less than a day")
            
            total_duration = ", ".join(parts)

        # --- 8. Avg Messages Per Day ---
        avg_messages_per_day = 0
        if not df.empty:
            min_date = df['datetime'].min()
            max_date = df['datetime'].max()
            days_diff = (max_date - min_date).days
            if days_diff < 1:
                days_diff = 1
            avg_messages_per_day = len(df) / days_diff

        return {
            "sentiment_by_person": sentiment_by_person.to_dict(orient='records'),
            "hourly_activity": hourly_activity_data,
            "conversation_initiation": conversation_starts.to_dict(orient='records'),
            "emoji_stats": {
                "by_person": user_emoji_stats
            },
            "word_clouds": user_word_freq,
            "domain_stats": user_domain_stats,
            "total_messages": len(df),
            "participants": df['author'].unique().tolist(),
            "total_duration": total_duration,
            "avg_messages_per_day": round(avg_messages_per_day, 1)
        }

