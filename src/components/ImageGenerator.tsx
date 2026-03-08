import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Sparkles, Download, Loader2, AlertCircle } from 'lucide-react';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.image) {
        setImage(data.image);
      } else {
        throw new Error('No image was generated. Try a different prompt.');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `generated-lake-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const suggestions = [
    "A peaceful sunset over Houghton Lake with a lone kayak in the distance",
    "Crystal clear water of Higgins Lake with colorful pebbles visible on the bottom",
    "A family of ducks swimming past a wooden dock at dawn",
    "The winding Cut River surrounded by lush green trees in autumn",
    "A vibrant orange and purple sky reflecting on calm lake water"
  ];

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-4">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lake-blue/10 text-lake-blue text-sm font-bold mb-4"
        >
          <Sparkles size={16} />
          <span>AI Powered</span>
        </motion.div>
        <h1 className="font-serif text-5xl mb-4 text-lake-blue">Lake Vision Generator</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Visualize your perfect day on the water. Describe a scene at Houghton or Higgins Lake, and our AI will bring it to life.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <label className="block text-sm font-bold mb-4 uppercase tracking-widest text-gray-500">Your Vision</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A serene morning on Higgins Lake with mist rising off the water..."
              className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none min-h-[150px] text-lg transition-all"
            />
            
            <div className="mt-6 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-lake-blue/10 hover:text-lake-blue transition-colors"
                >
                  {s.length > 30 ? s.substring(0, 30) + '...' : s}
                </button>
              ))}
            </div>

            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="btn-primary w-full mt-8 flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon size={20} />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3"
            >
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </div>

        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center group">
          <AnimatePresence mode="wait">
            {image ? (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <img
                  src={image}
                  alt="Generated lake scene"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={downloadImage}
                    className="p-4 rounded-full bg-white text-lake-blue hover:scale-110 transition-transform shadow-lg"
                    title="Download Image"
                  >
                    <Download size={24} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-12"
              >
                <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <ImageIcon size={40} />
                </div>
                <p className="text-gray-400 font-medium">Your generated image will appear here</p>
                {loading && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 rounded-full bg-lake-blue"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-lake-blue"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-lake-blue"
                      />
                    </div>
                    <p className="text-xs font-bold text-lake-blue uppercase tracking-widest">Painting your vision...</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-sand/50 border border-sand">
          <h3 className="font-bold text-lake-blue mb-2">Be Descriptive</h3>
          <p className="text-sm text-gray-600">Include details about lighting, weather, and specific landmarks like "The Cut River" or "Higgins Lake".</p>
        </div>
        <div className="p-8 rounded-3xl bg-sand/50 border border-sand">
          <h3 className="font-bold text-lake-blue mb-2">Artistic Styles</h3>
          <p className="text-sm text-gray-600">Try adding styles like "oil painting", "cinematic photography", or "vintage postcard" to your prompt.</p>
        </div>
        <div className="p-8 rounded-3xl bg-sand/50 border border-sand">
          <h3 className="font-bold text-lake-blue mb-2">Instant Download</h3>
          <p className="text-sm text-gray-600">Once generated, you can download your custom lake vision to use as a wallpaper or share with friends.</p>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
