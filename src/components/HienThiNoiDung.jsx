export default function HienThiNoiDung({ json }) {
  if (!json) return null

  let data
  try {
    data = typeof json === 'string' ? JSON.parse(json) : json
  } catch (e) {
    return <p>{json}</p>
  }

  const renderNode = (node, index) => {
    if (!node) return null

    if (node.type === 'text') {
      let element = node.text

      if (node.marks) {
        node.marks.forEach(mark => {
          if (mark.type === 'bold') {
            element = <strong key={index}>{element}</strong>
          } else if (mark.type === 'italic') {
            element = <em key={index}>{element}</em>
          } else if (mark.type === 'underline') {
            element = <u key={index}>{element}</u>
          } else if (mark.type === 'strike') {
            element = <s key={index}>{element}</s>
          } else if (mark.type === 'code') {
            element = <code key={index}>{element}</code>
          } else if (mark.type === 'link') {
            element = (
              <a 
                key={index} 
                href={mark.attrs.href} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {element}
              </a>
            )
          } else if (mark.type === 'highlight') {
            element = (
              <mark 
                key={index} 
                style={{ backgroundColor: mark.attrs?.color || '#ffedd5' }}
              >
                {element}
              </mark>
            )
          } else if (mark.type === 'textStyle') {
            element = (
              <span 
                key={index} 
                style={{ color: mark.attrs?.color }}
              >
                {element}
              </span>
            )
          }
        })
      }
      return element
    }

    const children = node.content ? node.content.map((child, idx) => renderNode(child, idx)) : null

    switch (node.type) {
      case 'doc':
        return <div key={index}>{children}</div>
      case 'paragraph':
        return <p key={index}>{children}</p>
      case 'heading':
        const Level = `h${node.attrs?.level || 1}`
        return <Level key={index}>{children}</Level>
      case 'bulletList':
        return <ul key={index}>{children}</ul>
      case 'orderedList':
        return <ol key={index}>{children}</ol>
      case 'listItem':
        return <li key={index}>{children}</li>
      case 'blockquote':
        return <blockquote key={index}>{children}</blockquote>
      case 'codeBlock':
        return (
          <pre key={index}>
            <code>{children}</code>
          </pre>
        )
      case 'horizontalRule':
        return <hr key={index} />
      case 'image':
        return (
          <img 
            key={index} 
            src={node.attrs.src} 
            alt={node.attrs.alt || ''} 
            style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} 
          />
        )
      case 'table':
        return (
          <table key={index}>
            <tbody>{children}</tbody>
          </table>
        )
      case 'tableRow':
        return <tr key={index}>{children}</tr>
      case 'tableHeader':
        return <th key={index}>{children}</th>
      case 'tableCell':
        return <td key={index}>{children}</td>
      default:
        return <div key={index}>{children}</div>
    }
  }

  return <div className="editor-content">{renderNode(data, 0)}</div>
}
