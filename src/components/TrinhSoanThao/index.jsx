'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import Placeholder from '@tiptap/extension-placeholder'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import {
  Undo, Redo, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Link2, Image as ImageIcon,
  Table as TableIcon, Code, Minus, Save, Eye, EyeOff
} from 'lucide-react'

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-9\s-]|_)+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function TrinhSoanThao({ post, userId }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '')
  const [status, setStatus] = useState(post?.status || 'draft')
  const [seoTitle, setSeoTitle] = useState(post?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(post?.seo_description || '')
  
  const [wordCount, setWordCount] = useState(0)
  const [readTime, setReadTime] = useState(0)
  const [saveStatus, setSaveStatus] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [slugModified, setSlugModified] = useState(!!post?.slug)

  const isSaving = useRef(false)

  const handleImageUpload = async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('post-assets')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (e) {
      alert('Lỗi tải ảnh lên: ' + e.message)
      return null
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const url = await handleImageUpload(file)
    if (url) {
      setCoverImageUrl(url)
    }
    setUploadingCover(false)
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Bắt đầu viết nội dung bài viết của bạn tại đây...' })
    ],
    content: post?.content ? JSON.parse(post.content) : '',
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleImageUpload(file).then(url => {
              if (url) {
                const node = view.state.schema.nodes.image.create({ src: url })
                const transaction = view.state.tr.replaceSelectionWith(node)
                view.dispatch(transaction)
              }
            })
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleImageUpload(file).then(url => {
              if (url) {
                const node = view.state.schema.nodes.image.create({ src: url })
                const transaction = view.state.tr.replaceSelectionWith(node)
                view.dispatch(transaction)
              }
            })
            return true
          }
        }
        return false
      }
    },
    onUpdate({ editor: ed }) {
      const text = ed.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setWordCount(words)
      setReadTime(Math.ceil(words / 200))
    }
  })

  useEffect(() => {
    if (editor) {
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setWordCount(words)
      setReadTime(Math.ceil(words / 200))
    }
  }, [editor])

  useEffect(() => {
    if (!slugModified && title) {
      setSlug(slugify(title))
    }
  }, [title, slugModified])

  const handleSave = async (forceStatus = null) => {
    if (!title) {
      return
    }

    isSaving.current = true
    setSaveStatus('Đang lưu...')
    
    const finalStatus = forceStatus || status
    const contentHtml = editor ? JSON.stringify(editor.getJSON()) : ''

    const postData = {
      author_id: userId,
      title,
      slug,
      content: contentHtml,
      excerpt,
      cover_image_url: coverImageUrl,
      status: finalStatus,
      seo_title: seoTitle || title,
      seo_description: seoDescription || excerpt,
      updated_at: new Date().toISOString()
    }

    if (finalStatus === 'published' && !post?.published_at) {
      postData.published_at = new Date().toISOString()
    }

    let saveError = null
    let returnedPost = null

    if (post?.id) {
      const { data, error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', post.id)
        .select()
      saveError = error
      returnedPost = data?.[0]
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
      saveError = error
      returnedPost = data?.[0]
    }

    if (saveError) {
      setSaveStatus('Lỗi khi lưu!')
    } else {
      const now = new Date()
      setSaveStatus(`Đã lưu lúc ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
      setStatus(finalStatus)
      if (!post?.id && returnedPost?.id) {
        router.push(`/dashboard/posts/${returnedPost.id}/edit`)
      }
    }
    isSaving.current = false
  }

  useEffect(() => {
    if (!editor) return

    const interval = setInterval(() => {
      if (!isSaving.current && title) {
        handleSave()
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [editor, title, slug, coverImageUrl, status, excerpt, seoTitle, seoDescription])

  const insertLink = () => {
    const url = prompt('Nhập địa chỉ liên kết (URL):')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const insertImage = () => {
    const url = prompt('Nhập địa chỉ hình ảnh (URL):')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  if (!editor) return null

  return (
    <div>
      <div className="flex justify-between align-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1>{post?.id ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>
          <p style={{ color: 'var(--text-tertiary)' }}>{saveStatus || 'Nháp tự động lưu sau mỗi 15 giây'}</p>
        </div>
        <div className="flex gap-sm">
          <button onClick={() => setPreviewMode(!previewMode)} className="btn btn-secondary">
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{previewMode ? 'Sửa nội dung' : 'Xem trước'}</span>
          </button>
          <button onClick={() => handleSave(status)} className="btn btn-secondary">
            <Save size={16} />
            <span>Lưu nháp</span>
          </button>
          <button onClick={() => handleSave('published')} className="btn btn-primary">
            <span>Xuất bản</span>
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="card" style={{ padding: '48px', maxWidth: '800px', margin: '0 auto' }}>
          {coverImageUrl && (
            <img src={coverImageUrl} alt={title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }} />
          )}
          <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>{title || 'Chưa nhập tiêu đề'}</h1>
          <div className="editor-content" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
        </div>
      ) : (
        <div className="editor-layout">
          <div>
            <input
              type="text"
              placeholder="Nhập tiêu đề bài viết..."
              className="editor-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="editor-toolbar">
              <button onClick={() => editor.chain().focus().undo().run()} className="toolbar-btn">
                <Undo size={16} />
              </button>
              <button onClick={() => editor.chain().focus().redo().run()} className="toolbar-btn">
                <Redo size={16} />
              </button>
              <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}>
                <Bold size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}>
                <Italic size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}>
                <UnderlineIcon size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}>
                <Strikethrough size={16} />
              </button>
              <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}>
                <Heading1 size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}>
                <Heading2 size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}>
                <Heading3 size={16} />
              </button>
              <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}>
                <List size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}>
                <ListOrdered size={16} />
              </button>
              <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
              <button onClick={insertLink} className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}>
                <Link2 size={16} />
              </button>
              <button onClick={insertImage} className="toolbar-btn">
                <ImageIcon size={16} />
              </button>
              <button onClick={insertTable} className="toolbar-btn">
                <TableIcon size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}>
                <Code size={16} />
              </button>
              <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="toolbar-btn">
                <Minus size={16} />
              </button>
            </div>

            <div className="editor-panel">
              <EditorContent editor={editor} className="editor-content" />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>Số từ: {wordCount}</span>
              <span>Thời gian đọc: {readTime} phút</span>
            </div>
          </div>

          <aside className="editor-sidebar">
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '16px' }}>Cài đặt bài viết</h3>
              
              <div className="form-group">
                <label className="form-label">Đường dẫn bài viết (Slug)</label>
                <input
                  type="text"
                  className="form-control"
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value))
                    setSlugModified(true)
                  }}
                  placeholder="tieu-de-bai-viet"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả ngắn (Excerpt)</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Mô tả tóm tắt nội dung bài viết..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hình ảnh bìa (Cover Image)</label>
                {coverImageUrl && (
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <img src={coverImageUrl} alt="Cover Preview" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                    <button 
                      onClick={() => setCoverImageUrl('')} 
                      className="btn btn-danger" 
                      style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px' }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  style={{ display: 'none' }}
                  id="cover-upload-input"
                />
                <label htmlFor="cover-upload-input" className="btn btn-secondary w-full" style={{ cursor: 'pointer' }}>
                  {uploadingCover ? 'Đang tải lên...' : 'Tải ảnh bìa lên'}
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái xuất bản</label>
                <select 
                  className="form-control" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Xuất bản</option>
                </select>
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '16px' }}>Cài đặt SEO</h3>
              
              <div className="form-group">
                <label className="form-label">SEO Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Tiêu đề hiển thị trên Google..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">SEO Description</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Mô tả hiển thị trên Google..."
                />
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
