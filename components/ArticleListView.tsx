import React, { useEffect, useState } from 'react';
import { Trash2, BookOpen, Clock, BarChart3 } from 'lucide-react';
import { articleService, Article } from '../services/articleService';

interface ArticleListViewProps {
  onSelectArticle: (article: Article) => void;
  onBack: () => void;
}

export const ArticleListView: React.FC<ArticleListViewProps> = ({
  onSelectArticle,
  onBack,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articleService.getArticles();
      setArticles(data);
    } catch (error) {
      console.error('加载文章失败:', error);
      alert('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      await articleService.deleteArticle(id);
      setArticles(articles.filter((a) => a._id !== id));
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '初级';
      case 'intermediate':
        return '中级';
      case 'advanced':
        return '高级';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          <p className="mt-2 text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-slate-500 hover:text-rose-500 mb-2 transition-colors"
          >
            ← 返回
          </button>
          <h2 className="text-2xl font-bold text-slate-900">我的文章库</h2>
          <p className="text-sm text-slate-400 mt-1">
            共 {articles.length} 篇文章
          </p>
        </div>
      </div>

      {/* Article List */}
      {articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400">还没有文章</p>
          <p className="text-sm text-slate-300 mt-1">
            上传文本或拍照识别来创建第一篇文章吧
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article._id}
              onClick={() => onSelectArticle(article)}
              className="bg-white rounded-xl p-5 border border-slate-100 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800">{article.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(
                        article.difficulty
                      )}`}
                    >
                      {getDifficultyText(article.difficulty)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {article.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <BarChart3 size={14} />
                      <span>{article.wordCount} 词</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>{article.sections.length} 段</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(article._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
