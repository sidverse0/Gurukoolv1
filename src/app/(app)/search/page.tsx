
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { aiSearch, type AiSearchOutput } from '@/ai/flows/ai-search';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const examplePrompts = [
  'Explain the theory of relativity',
  'What was the main cause of World War II?',
  'Summarize the plot of "Hamlet"',
  'How does photosynthesis work?',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiSearchOutput | null>(null);
  const { toast } = useToast();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await aiSearch({ query: searchQuery });
      setResult(res);
    } catch (error) {
      console.error('AI Search Error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description:
          'Failed to get a response from the AI. Please try again.',
      });
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <div className="flex flex-col items-center justify-center text-center">
        <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-lg">
          <AvatarImage
            src="https://picsum.photos/seed/ai-guruji/200"
            data-ai-hint="friendly robot"
          />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <h1 className="mt-6 font-headline text-3xl font-bold tracking-tight md:text-4xl">
          AI Guruji
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Aapke har sawaal ka jawab yahan milega. Poochiye kuch bhi!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="my-8">
        <div className="relative">
          <Input
            type="search"
            placeholder="e.g., Explain the fundamentals of React..."
            className="w-full rounded-full bg-background/60 py-6 pl-5 pr-28"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            <span className="ml-2 hidden sm:inline">
              {loading ? 'Soch Raha Hu...' : 'Poochhein'}
            </span>
          </Button>
        </div>
      </form>

      {!loading && !result && (
        <div>
          <h3 className="mb-4 text-center text-sm font-semibold text-muted-foreground">
            KUCHH EXAMPLE TRY KAREIN
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {examplePrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => {
                  setQuery(prompt);
                  handleSearch(prompt);
                }}
                className="rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent/50 hover:text-accent-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-center text-muted-foreground">
            AI Guruji aapke liye jawab taiyaar kar rahe hain, कृपया प्रतीक्षा करें...
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">
                {result.summary}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Key Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
