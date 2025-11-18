import React from 'react';
import { Plus, Trash2, Edit, X, Image as ImageIcon } from 'lucide-react';

const ContentCardBuilder = ({
  contentCards,
  currentCard,
  setCurrentCard,
  currentCardImages,
  setCurrentCardImages,
  editingCardIndex,
  setEditingCardIndex,
  isDark,
  onAddCard,
  onRemoveCard,
  onEditCard,
  onCancelEditCard
}) => {
  const handleCardImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setCurrentCardImages(prev => [...prev, ...files]);
  };

  const handleRemoveCardImage = (index) => {
    setCurrentCardImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Content Cards ({contentCards.length})
      </h3>

      {contentCards.length > 0 && (
        <div className="space-y-3 mb-6">
          {contentCards.map((card, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {card.heading}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditCard(index)}
                    className={`p-1 rounded ${
                      isDark ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                    }`}
                    title="Edit Card"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveCard(index)}
                    className={`p-1 rounded ${
                      isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                    }`}
                    title="Delete Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className={`text-sm whitespace-pre-line mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {card.content.length > 150 ? card.content.substring(0, 150) + '...' : card.content}
              </p>
              {card.images && card.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {card.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.preview}
                      alt={`Preview ${i + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Card Heading
          </label>
          <input
            type="text"
            value={currentCard.heading}
            onChange={(e) => setCurrentCard({ ...currentCard, heading: e.target.value })}
            placeholder="e.g., What are Formal Languages?"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Card Content
          </label>
          <textarea
            value={currentCard.content}
            onChange={(e) => setCurrentCard({ ...currentCard, content: e.target.value })}
            placeholder="Enter the detailed content for this section..."
            rows={8}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Images (Optional)
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center justify-center mb-4">
              <ImageIcon className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCardImageUpload}
              className="hidden"
              id="card-images"
            />
            <label
              htmlFor="card-images"
              className={`cursor-pointer px-4 py-2 rounded-lg font-medium block text-center ${
                isDark
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Choose Images
            </label>
            {currentCardImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {currentCardImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCardImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {editingCardIndex !== null && (
            <button
              type="button"
              onClick={onCancelEditCard}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onAddCard}
            disabled={!currentCard.heading || !currentCard.content}
            className={`${
              editingCardIndex !== null ? 'flex-1' : 'w-full'
            } px-4 py-2 rounded-lg border-2 border-dashed font-medium transition-all ${
              currentCard.heading && currentCard.content
                ? isDark
                  ? 'border-blue-600 text-blue-400 hover:bg-blue-600/10'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                : isDark
                  ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            {editingCardIndex !== null ? 'Update Card' : 'Add Card'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCardBuilder;