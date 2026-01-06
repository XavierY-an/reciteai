import axios from 'axios';
import { config } from '../config/index.js';

// 智谱 GLM API 调用
class ZhipuService {
  constructor() {
    this.apiUrl = config.zhipu.apiUrl;
    this.apiKey = config.zhipu.apiKey;
  }

  // 生成 JWT token（智谱 API 需要）
  async generateToken() {
    // 智谱 API 的简单认证方式，直接使用 API Key
    return this.apiKey;
  }

  // 调用智谱 GLM-4 模型
  async chat(messages, options = {}) {
    try {
      const token = await this.generateToken();

      const response = await axios.post(
        this.apiUrl,
        {
          model: options.model || 'glm-4-flash',
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          top_p: options.topP || 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('智谱 API 调用失败:', error.response?.data || error.message);
      throw new Error('AI 服务调用失败');
    }
  }

  // 分析文本难度
  async analyzeDifficulty(text) {
    const messages = [
      {
        role: 'system',
        content: '你是一个英语教育专家。请分析文本的英语难度等级。'
      },
      {
        role: 'user',
        content: `请分析以下文本的难度等级（只返回 beginner/intermediate/advanced 其中一个）：\n\n${text.substring(0, 500)}`
      }
    ];

    const response = await this.chat(messages, { temperature: 0.3 });

    let difficulty = response.choices[0].message.content.trim().toLowerCase();

    // 标准化难度等级
    if (difficulty.includes('beginner') || difficulty.includes('初级')) {
      return 'beginner';
    } else if (difficulty.includes('advanced') || difficulty.includes('高级')) {
      return 'advanced';
    } else {
      return 'intermediate';
    }
  }

  // 智能拆分文本（根据难度动态调整）
  async segmentText(text, difficulty = 'intermediate') {
    // 根据难度确定拆分策略
    const segmentStrategy = this.getSegmentStrategy(difficulty);

    const messages = [
      {
        role: 'system',
        content: `你是一个专业的英语教育助手。请将文本拆解成易于学习的段落，每个段落包含多个语义片段。

**拆分策略：**
${segmentStrategy}

**输出格式（必须是有效的 JSON）：**
\`\`\`json
{
  "sections": [
    {
      "id": "section-1",
      "title": "段落标题（概括内容）",
      "translation": "整段的中文翻译",
      "theme": "blue",
      "segments": [
        {
          "id": "seg-1",
          "text": "原文片段",
          "translation": "中文翻译",
          "isHidden": true,
          "role": "SUBJECT"
        }
      ]
    }
  ]
}
\`\`\`

**语法角色类型：**
- SUBJECT: 主语（动作执行者）
- VERB: 谓语（动作）
- OBJECT: 宾语（动作承受者）
- PREP_PHRASE: 介词短语
- CLAUSE: 从句
- NON_FINITE: 非谓语动词
- PARENTHETICAL: 插入语/连接词
- OTHER: 其他`
      },
      {
        role: 'user',
        content: `请分析以下文本：\n\n${text}`
      }
    ];

    const response = await this.chat(messages, { temperature: 0.5, maxTokens: 3000 });

    // 解析 JSON 响应
    let content = response.choices[0].message.content;

    // 移除 markdown 代码块标记
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch (error) {
      console.error('JSON 解析失败:', content);
      throw new Error('AI 返回格式错误');
    }

    // 分配颜色主题
    const themes = ['blue', 'emerald', 'violet', 'amber'];
    result.sections.forEach((section, index) => {
      section.theme = themes[index % themes.length];

      // 确保 segments 有 isHidden 字段
      section.segments.forEach(seg => {
        if (seg.isHidden === undefined) {
          seg.isHidden = true;
        }
      });
    });

    return result.sections;
  }

  // 根据难度返回拆分策略
  getSegmentStrategy(difficulty) {
    switch (difficulty) {
      case 'beginner':
        return `- 每个句子拆分成 3-5 个片段
- 每个片段尽量简短（2-4 个单词）
- 重点标记主语、谓语、宾语
- 提供详细的中文翻译`;

      case 'advanced':
        return `- 按照语义和逻辑关系拆分
- 保持较长语块的完整性
- 重点关注从句和非谓语动词结构
- 提供准确的翻译`;

      case 'intermediate':
      default:
        return `- 每个句子拆分成 5-8 个片段
- 平衡片段长度，便于记忆
- 重点标记语法成分
- 提供准确的中文翻译`;
    }
  }

  // OCR 图片识别（使用智谱 GLM-4V）
  async extractTextFromImage(base64Image, mimeType) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          },
          {
            type: 'text',
            text: '请识别图片中的所有英文文字内容，只返回识别出的文字，不要添加任何解释。'
          }
        ]
      }
    ];

    const response = await this.chat(messages, {
      model: 'glm-4v', // 使用视觉模型
      temperature: 0.3,
      maxTokens: 1000
    });

    const text = response.choices[0].message.content.trim();
    return text;
  }

  // 评估背诵结果
  async evaluateRecitation(originalText, recitedText) {
    const messages = [
      {
        role: 'system',
        content: `你是一个英语教育专家。请对比用户的背诵文本和原文，给出详细的评估。

**输出格式（必须是有效的 JSON）：**
\`\`\`json
{
  "score": 85,
  "feedback": "整体背诵准确，但有少量遗漏。",
  "detailedAnalysis": [
    {
      "word": "Dreams",
      "status": "correct",
      "correctedWord": null
    },
    {
      "word": "treasure",
      "status": "missed",
      "correctedWord": null
    },
    {
      "word": "founded",
      "status": "wrong",
      "correctedWord": "found"
    }
  ]
}
\`\`\`

**状态说明：**
- correct: 正确
- missed: 遗漏（原文有，背诵没有）
- wrong: 错误（背诵的词不正确）
- extra: 多余（原文没有，背诵多了）`
      },
      {
        role: 'user',
        content: `原文：\n${originalText}\n\n背诵：\n${recitedText}\n\n请评估背诵质量。`
      }
    ];

    const response = await this.chat(messages, { temperature: 0.3, maxTokens: 1500 });

    // 解析 JSON
    let content = response.choices[0].message.content;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('JSON 解析失败:', content);
      // 返回默认评分
      return {
        score: 60,
        feedback: '评估失败，请重试',
        detailedAnalysis: []
      };
    }
  }
}

export default new ZhipuService();
