import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  FileCode,
  Check,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  readOnly = false,
}) => {
  const [isRawMarkdown, setIsRawMarkdown] = useState(false);
  const [rawText, setRawText] = useState(content);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML() && !isRawMarkdown) {
      editor.commands.setContent(content);
    }
    setRawText(content);
  }, [content, editor, isRawMarkdown]);

  const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    onChange(val);
  };

  if (isRawMarkdown) {
    return (
      <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 flex items-center space-x-1">
            <FileCode className="w-3.5 h-3.5" />
            <span>Raw Markdown Source</span>
          </span>
          <button
            onClick={() => setIsRawMarkdown(false)}
            className="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium"
          >
            Switch to Visual Rich Editor
          </button>
        </div>
        <textarea
          value={rawText}
          onChange={handleRawChange}
          rows={14}
          disabled={readOnly}
          className="w-full p-4 font-mono text-xs text-slate-800 focus:outline-hidden bg-slate-900 text-slate-100 leading-relaxed"
          placeholder="Enter markdown..."
        />
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      {/* Toolbar */}
      {!readOnly && editor && (
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center space-x-1 flex-wrap">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive('bold') ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive('italic') ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsRawMarkdown(true)}
            className="text-xs px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium flex items-center space-x-1"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Markdown Mode</span>
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="p-4 sm:p-6 min-h-[320px] prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed focus:outline-hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
