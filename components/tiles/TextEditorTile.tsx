'use client'

import { memo, useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import styles from './TextEditorTile.module.css'

// ── Constants ────────────────────────────────────────
const EDITOR_HTML =
  '<p>This tile was built to show interactions for how I would approach a basic text editor. Select any text to see the toolbar appear. ' +
  'Every interaction here was considered on purpose: where the toolbar lands, how it opens, what happens ' +
  "when you change your mind. Small details, but they're the ones people actually feel. This paragraph " +
  'exists mostly so you have something to select.</p>'

type FormatTag = 'strong' | 'em' | 'u' | 's' | 'a'

const BOLD_SVG =
  '<svg viewBox="0 0 640 640" width="14" height="14" fill="currentColor"><path d="M160 96C142.3 96 128 110.3 128 128C128 145.7 142.3 160 160 160L192 160L192 480L160 480C142.3 480 128 494.3 128 512C128 529.7 142.3 544 160 544L384 544C454.7 544 512 486.7 512 416C512 369.5 487.2 328.7 450 306.3C468.7 284 480 255.3 480 224C480 153.3 422.7 96 352 96L160 96zM416 224C416 259.3 387.3 288 352 288L256 288L256 160L352 160C387.3 160 416 188.7 416 224zM256 480L256 352L384 352C419.3 352 448 380.7 448 416C448 451.3 419.3 480 384 480L256 480z"/></svg>'
const ITALIC_SVG =
  '<svg viewBox="0 0 640 640" width="14" height="14" fill="currentColor"><path d="M256 128C256 110.3 270.3 96 288 96L480 96C497.7 96 512 110.3 512 128C512 145.7 497.7 160 480 160L421.3 160L288 480L352 480C369.7 480 384 494.3 384 512C384 529.7 369.7 544 352 544L160 544C142.3 544 128 529.7 128 512C128 494.3 142.3 480 160 480L218.7 480L352 160L288 160C270.3 160 256 145.7 256 128z"/></svg>'
const UNDERLINE_SVG =
  '<svg viewBox="0 0 640 640" width="14" height="14" fill="currentColor"><path d="M128 96C128 78.3 142.3 64 160 64L224 64C241.7 64 256 78.3 256 96C256 113.7 241.7 128 224 128L224 288C224 341 267 384 320 384C373 384 416 341 416 288L416 128C398.3 128 384 113.7 384 96C384 78.3 398.3 64 416 64L480 64C497.7 64 512 78.3 512 96C512 113.7 497.7 128 480 128L480 288C480 376.4 408.4 448 320 448C231.6 448 160 376.4 160 288L160 128C142.3 128 128 113.7 128 96zM128 544C128 526.3 142.3 512 160 512L480 512C497.7 512 512 526.3 512 544C512 561.7 497.7 576 480 576L160 576C142.3 576 128 561.7 128 544z"/></svg>'
const STRIKE_SVG =
  '<svg viewBox="0 0 640 640" width="14" height="14" fill="currentColor"><path d="M160 221.5C160 152.2 216.2 96 285.5 96L432 96C449.7 96 464 110.3 464 128C464 145.7 449.7 160 432 160L285.5 160C251.5 160 224 187.5 224 221.5C224 252.5 247.1 278.7 277.9 282.5L322 288L544 288C561.7 288 576 302.3 576 320C576 337.7 561.7 352 544 352L96 352C78.3 352 64 337.7 64 320C64 302.3 78.3 288 96 288L179.1 288C167 268.6 160 245.8 160 221.5zM413.2 400L478.7 400C479.6 406.1 480.1 412.2 480.1 418.5C480.1 487.8 423.9 544 354.6 544L208 544C190.3 544 176 529.7 176 512C176 494.3 190.3 480 208 480L354.5 480C388.5 480 416 452.5 416 418.5C416 412.1 415 405.8 413.2 400z"/></svg>'
const LINK_SVG =
  '<svg viewBox="0 0 640 640" width="14" height="14" fill="currentColor"><path d="M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z"/></svg>'
const BACK_SVG =
  '<svg viewBox="0 0 320 512" width="12" height="14" fill="currentColor"><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>'
const TRASH_SVG =
  '<svg viewBox="0 0 448 512" width="13" height="14" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>'

const TB_ORDER: { key: string; tag: FormatTag; tooltip: string; svg: string }[] = [
  { key: 'bold', tag: 'strong', tooltip: 'Bold', svg: BOLD_SVG },
  { key: 'italic', tag: 'em', tooltip: 'Italic', svg: ITALIC_SVG },
  { key: 'underline', tag: 'u', tooltip: 'Underline', svg: UNDERLINE_SVG },
  { key: 'strike', tag: 's', tooltip: 'Strikethrough', svg: STRIKE_SVG },
  { key: 'link', tag: 'a', tooltip: 'Link', svg: LINK_SVG },
]

const TB_BTN_CLASS =
  'w-8 h-8 rounded-lg flex items-center justify-center text-zinc-700 bg-transparent border-0 transition-all duration-100 ease-out hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.95] flex-shrink-0'
const LINK_BACK_CLASS =
  'w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 bg-transparent border-0 transition-all duration-100 ease-out hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.95] flex-shrink-0'

// ── Component ────────────────────────────────────────
function TextEditorTile() {
  const editorRef = useRef<HTMLDivElement>(null)
  const resetFnRef = useRef<() => void>(() => {})
  const resetIconRef = useRef<HTMLElement>(null)
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
    }
  }, [])

  function handleResetClick() {
    // Cancel any in-flight reset so rapid re-clicks restart cleanly
    // instead of stacking or firing the actual content reset early.
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)

    const icon = resetIconRef.current
    const card = editorRef.current
    // Remove -> force reflow -> re-add: restarts the CSS animation from
    // its beginning even if it's already mid-playback from a prior click.
    if (icon) {
      icon.classList.remove(styles.iconSpin)
      icon.getBoundingClientRect()
      icon.classList.add(styles.iconSpin)
    }
    if (card) {
      card.classList.remove(styles.cardShake)
      card.getBoundingClientRect()
      card.classList.add(styles.cardShake)
    }

    // The visible content reset lands at the end of the shake, not on
    // click, so it reads as "shake plays, then the reset lands."
    resetTimeoutRef.current = setTimeout(() => {
      resetFnRef.current()
      resetTimeoutRef.current = null
    }, 500)
  }

  useEffect(() => {
    const editor = editorRef.current!
    const originalHTML = editor.innerHTML

    // ── Build floating toolbar + tooltip as raw DOM, appended to
    // document.body so `position: fixed` is always viewport-relative
    // regardless of any transformed ancestor elsewhere on the page. ──
    const toolbar = document.createElement('div')
    toolbar.setAttribute('role', 'toolbar')
    toolbar.setAttribute('aria-label', 'Text formatting')
    toolbar.className = `${styles.toolbar} ${styles.toolbarHidden} fixed bg-white border border-zinc-200 rounded-xl flex items-center gap-1 p-1 overflow-hidden z-[1000]`
    toolbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'
    toolbar.innerHTML = `
      <div data-main-actions class="${styles.pane} flex items-center gap-1">
        ${TB_ORDER.map(
          (entry) =>
            `<button type="button" data-tb-btn="${entry.key}" data-tooltip="${entry.tooltip}" class="${TB_BTN_CLASS}">${entry.svg}</button>`,
        ).join('')}
      </div>
      <div data-link-panel class="${styles.pane} flex items-center gap-1" style="display:none">
        <button type="button" data-link-back title="Back" class="${LINK_BACK_CLASS}">${BACK_SVG}</button>
        <input data-link-input type="text" placeholder="Paste a link…" class="${styles.linkInput} border border-zinc-200 rounded-lg px-2 h-8 text-xs text-zinc-800 outline-none w-40 placeholder:text-zinc-400" />
        <button type="button" data-link-delete title="Remove link" class="${styles.linkDelete} w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 bg-transparent border-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0" style="display:none">${TRASH_SVG}</button>
      </div>
    `
    document.body.appendChild(toolbar)

    const tooltip = document.createElement('div')
    tooltip.className = `${styles.tooltip} fixed bg-zinc-800 text-white text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-[1100]`
    document.body.appendChild(tooltip)

    const mainActions = toolbar.querySelector<HTMLDivElement>('[data-main-actions]')!
    const linkPanel = toolbar.querySelector<HTMLDivElement>('[data-link-panel]')!
    const linkInput = toolbar.querySelector<HTMLInputElement>('[data-link-input]')!
    const linkDeleteBtn = toolbar.querySelector<HTMLButtonElement>('[data-link-delete]')!
    const linkBackBtn = toolbar.querySelector<HTMLButtonElement>('[data-link-back]')!
    const tbButtons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('[data-tb-btn]'))

    let savedRange: Range | null = null
    let activeTextNode: Node | null = null

    // ── Format helpers ──────────────────────────────
    function firstTextNode(el: Node): Node {
      let node: Node | null = el
      while (node && node.nodeType !== 3) node = node.firstChild
      return node || el
    }

    function lastTextNode(el: Node): Node {
      let node: Node | null = el
      while (node && node.nodeType !== 3) node = node.lastChild
      return node || el
    }

    function formatMatcher(tag: FormatTag) {
      if (tag === 'strong') return (el: Element) => el.classList.contains('font-semibold')
      if (tag === 'em') return (el: Element) => el.classList.contains('italic')
      if (tag === 'u') return (el: Element) => el.tagName !== 'A' && el.classList.contains('underline')
      if (tag === 's') return (el: Element) => el.classList.contains('line-through')
      return (el: Element) => el.tagName === 'A'
    }

    function findFormatAncestor(node: Node, matchFn: (el: Element) => boolean): Element | null {
      let el: Element | null = node.nodeType === 3 ? node.parentElement : (node as Element)
      while (el && el !== editor) {
        if (matchFn(el)) return el
        el = el.parentElement
      }
      return null
    }

    function collectFormats(node: Node) {
      const formats = { bold: false, italic: false, underline: false, strike: false, link: false }
      let el: Element | null = node.nodeType === 3 ? node.parentElement : (node as Element)
      while (el && el !== editor) {
        if (el.tagName === 'A') formats.link = true
        if (el.classList.contains('font-semibold')) formats.bold = true
        if (el.classList.contains('italic')) formats.italic = true
        if (el.classList.contains('underline') && el.tagName !== 'A') formats.underline = true
        if (el.classList.contains('line-through')) formats.strike = true
        el = el.parentElement
      }
      return formats
    }

    function setActive(btn: HTMLButtonElement, active: boolean) {
      btn.classList.toggle('bg-zinc-200', active)
      btn.classList.toggle('text-zinc-900', active)
      btn.classList.toggle('text-zinc-700', !active)
    }

    function syncActiveStates(node: Node) {
      const formats = collectFormats(node)
      const map: Record<string, boolean> = {
        bold: formats.bold,
        italic: formats.italic,
        underline: formats.underline,
        strike: formats.strike,
        link: formats.link,
      }
      tbButtons.forEach((btn) => setActive(btn, map[btn.dataset.tbBtn!]))
    }

    function unwrapElement(el: Element) {
      const parent = el.parentNode!
      while (el.firstChild) parent.insertBefore(el.firstChild, el)
      parent.removeChild(el)
    }

    function wrapTextNode(textNode: Node, tag: FormatTag) {
      const wrapper = document.createElement(tag === 'a' ? 'a' : 'span')
      if (tag === 'strong') wrapper.className = 'font-semibold'
      else if (tag === 'em') wrapper.className = 'italic'
      else if (tag === 'u') wrapper.className = 'underline'
      else if (tag === 's') wrapper.className = 'line-through'
      else wrapper.className = 'underline text-blue-600'
      textNode.parentNode!.insertBefore(wrapper, textNode)
      wrapper.appendChild(textNode)
      return wrapper
    }

    function reselectActiveTextNode() {
      if (!activeTextNode) return
      const range = document.createRange()
      range.selectNodeContents(activeTextNode)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      savedRange = range.cloneRange()
    }

    // ── Bounds safety: any Range sourced from window.getSelection() can
    // extend past the editor (e.g. a triple-click's end boundary landing
    // on a sibling element like the Reset button). clampRangeToEditor
    // intersects a range with the editor's own content so it's always
    // safe to hand to surroundContents/extractContents. isEditorRange is
    // the hard guard used right before any DOM mutation, independent of
    // whatever produced the range in the first place. ──
    function isEditorRange(range: Range): boolean {
      return editor.contains(range.commonAncestorContainer)
    }

    function clampRangeToEditor(range: Range): Range | null {
      // Clamp against the editor's actual first/last text node positions,
      // not editor's own child-list boundary (selectNodeContents(editor)
      // would land the end boundary right after the <p> element, an
      // element-level split point that makes extractContents clone the
      // <p> shell instead of just touching its text).
      const first = firstTextNode(editor)
      const last = lastTextNode(editor)
      if (first.nodeType !== 3 || last.nodeType !== 3) return null

      const editorRange = document.createRange()
      editorRange.setStart(first, 0)
      editorRange.setEnd(last, (last as CharacterData).length)

      const clamped = range.cloneRange()

      // No overlap with the editor's content at all (e.g. a drag that
      // starts and ends entirely below the tile) — nothing to salvage.
      // Check this on the original, unmutated range: setStart/setEnd can
      // themselves collapse the range in ways that make a post-hoc
      // "is it collapsed now" check ambiguous about whether there was
      // ever real overlap to begin with.
      //
      // Note: compareBoundaryPoints' constants are counter-intuitive —
      // per spec, A.compareBoundaryPoints(END_TO_START, B) compares
      // A's START to B's END (not the reverse the name suggests), and
      // START_TO_END compares A's END to B's START. Verified empirically.
      const startsAfterEditorEnds = clamped.compareBoundaryPoints(Range.END_TO_START, editorRange) > 0
      const endsBeforeEditorStarts = clamped.compareBoundaryPoints(Range.START_TO_END, editorRange) < 0
      if (startsAfterEditorEnds || endsBeforeEditorStarts) return null

      if (clamped.compareBoundaryPoints(Range.START_TO_START, editorRange) < 0) {
        clamped.setStart(first, 0)
      }
      if (clamped.compareBoundaryPoints(Range.END_TO_END, editorRange) > 0) {
        clamped.setEnd(last, (last as CharacterData).length)
      }

      if (clamped.collapsed || !clamped.toString().trim()) return null
      return clamped
    }

    function toggleFormat(tag: FormatTag) {
      if (activeTextNode) {
        const existing = findFormatAncestor(activeTextNode, formatMatcher(tag))
        if (existing) unwrapElement(existing)
        else wrapTextNode(activeTextNode, tag)
        syncActiveStates(activeTextNode)
        reselectActiveTextNode()
        return
      }

      if (!savedRange || !savedRange.toString().trim()) return
      if (!isEditorRange(savedRange)) return
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(savedRange)

      const span = document.createElement(tag === 'a' ? 'a' : 'span')
      if (tag === 'strong') span.className = 'font-semibold'
      else if (tag === 'em') span.className = 'italic'
      else if (tag === 'u') span.className = 'underline'
      else if (tag === 's') span.className = 'line-through'
      else span.className = 'underline text-blue-600'

      try {
        savedRange.surroundContents(span)
      } catch {
        const frag = savedRange.extractContents()
        span.appendChild(frag)
        savedRange.insertNode(span)
      }

      activeTextNode = firstTextNode(span)
      syncActiveStates(activeTextNode)
      reselectActiveTextNode()
    }

    // ── Positioning ─────────────────────────────────
    // range.getBoundingClientRect() covers the whole selection, so for a
    // multi-line selection it spans every line combined — anchoring the
    // toolbar to whichever line is widest rather than where the selection
    // actually ends. getClientRects() returns one rect per line instead;
    // the last non-empty one is the true final line. Some triple-click
    // selections also produce a trailing zero-size rect at the selection's
    // technical end point (not any visible text), so that gets filtered
    // out first.
    function getSelectionEndRect(range: Range): DOMRect {
      const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0)
      return rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect()
    }

    function positionToolbar(range: Range) {
      const rect = getSelectionEndRect(range)
      const editorRect = editor.getBoundingClientRect()
      const editorStyle = getComputedStyle(editor)
      const padLeft = parseFloat(editorStyle.paddingLeft) || 0
      const padRight = parseFloat(editorStyle.paddingRight) || 0
      const tbW = toolbar.offsetWidth || 220
      const gap = 8

      let x = rect.right
      const minX = editorRect.left + padLeft
      const maxX = editorRect.right - padRight - tbW
      if (x < minX) x = minX
      if (x > maxX) x = maxX

      toolbar.style.left = x + 'px'
      toolbar.style.top = rect.bottom + gap + 'px'
      toolbar.classList.remove(styles.toolbarHidden)
      toolbar.classList.add(styles.toolbarVisible)
    }

    function hideToolbar() {
      toolbar.classList.remove(styles.toolbarVisible)
      toolbar.classList.add(styles.toolbarHidden)
      exitLinkMode()
      savedRange = null
      activeTextNode = null
      tbButtons.forEach((btn) => setActive(btn, false))
    }

    // ── Link morph ──────────────────────────────────
    const MORPH_MS = 100
    const FADE_MS = 100
    let morphTimer: ReturnType<typeof setTimeout> | null = null

    function forceReflow(el: HTMLElement) {
      return el.getBoundingClientRect()
    }

    function morphToolbarTo(hideEl: HTMLElement, showEl: HTMLElement, onSettled?: () => void) {
      if (morphTimer) clearTimeout(morphTimer)

      const fromRect = toolbar.getBoundingClientRect()
      const centerX = fromRect.left + fromRect.width / 2

      toolbar.style.width = fromRect.width + 'px'
      toolbar.style.left = fromRect.left + 'px'
      forceReflow(toolbar)

      hideEl.style.opacity = '0'
      hideEl.style.filter = 'blur(2px)'

      morphTimer = setTimeout(() => {
        hideEl.style.display = 'none'
        showEl.style.display = 'flex'
        showEl.style.opacity = '0'
        showEl.style.filter = 'blur(2px)'

        const currentWidth = toolbar.style.width
        toolbar.style.width = 'auto'
        const toWidth = toolbar.getBoundingClientRect().width
        toolbar.style.width = currentWidth

        let newLeft = centerX - toWidth / 2

        const editorRect = editor.getBoundingClientRect()
        const editorStyle = getComputedStyle(editor)
        const padLeft = parseFloat(editorStyle.paddingLeft) || 0
        const padRight = parseFloat(editorStyle.paddingRight) || 0
        const minX = editorRect.left + padLeft
        const maxX = editorRect.right - padRight - toWidth
        if (newLeft < minX) newLeft = minX
        if (newLeft > maxX) newLeft = maxX

        requestAnimationFrame(() => {
          toolbar.style.width = toWidth + 'px'
          toolbar.style.left = newLeft + 'px'
          showEl.style.opacity = '1'
          showEl.style.filter = 'blur(0px)'
        })

        morphTimer = setTimeout(() => {
          toolbar.style.width = ''
          onSettled?.()
        }, MORPH_MS)
      }, FADE_MS)
    }

    function applyLinkFormat() {
      const url = linkInput.value.trim()

      if (activeTextNode) {
        const existing = findFormatAncestor(activeTextNode, formatMatcher('a'))
        if (existing) {
          existing.setAttribute('href', url || '#')
          existing.setAttribute('title', url)
        } else {
          const wrapper = wrapTextNode(activeTextNode, 'a')
          wrapper.setAttribute('href', url || '#')
          wrapper.setAttribute('title', url)
        }
        syncActiveStates(activeTextNode)
        updateLinkDeleteVisibility()
        return
      }

      if (!savedRange || !savedRange.toString().trim()) return
      if (!isEditorRange(savedRange)) return
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(savedRange)

      const span = document.createElement('a')
      span.className = 'underline text-blue-600'
      span.setAttribute('href', url || '#')
      span.setAttribute('title', url)

      try {
        savedRange.surroundContents(span)
      } catch {
        const frag = savedRange.extractContents()
        span.appendChild(frag)
        savedRange.insertNode(span)
      }

      sel?.removeAllRanges()
      activeTextNode = firstTextNode(span)
      syncActiveStates(activeTextNode)
      updateLinkDeleteVisibility()
    }

    function removeLinkFormat() {
      if (!activeTextNode) return
      const existing = findFormatAncestor(activeTextNode, formatMatcher('a'))
      if (existing) unwrapElement(existing)
      linkInput.value = ''
      syncActiveStates(activeTextNode)
    }

    let deleteMorphTimer: ReturnType<typeof setTimeout> | null = null
    const DELETE_ANIM_MS = 100

    function measureToolbarWidthWith(displayOverride: string) {
      const prevWidth = toolbar.style.width
      const prevDisplay = linkDeleteBtn.style.display
      linkDeleteBtn.style.display = displayOverride
      toolbar.style.width = 'auto'
      const w = toolbar.getBoundingClientRect().width
      toolbar.style.width = prevWidth
      linkDeleteBtn.style.display = prevDisplay
      return w
    }

    function animateShowLinkDelete() {
      if (deleteMorphTimer) clearTimeout(deleteMorphTimer)
      const fromWidth = toolbar.getBoundingClientRect().width
      toolbar.style.width = fromWidth + 'px'
      forceReflow(toolbar)

      linkDeleteBtn.style.display = 'flex'
      linkDeleteBtn.style.opacity = '0'
      linkDeleteBtn.style.transform = 'scale(0.5)'

      const toWidth = measureToolbarWidthWith('flex')

      requestAnimationFrame(() => {
        toolbar.style.width = toWidth + 'px'
        linkDeleteBtn.style.opacity = '1'
        linkDeleteBtn.style.transform = 'scale(1)'
      })

      deleteMorphTimer = setTimeout(() => {
        toolbar.style.width = ''
      }, DELETE_ANIM_MS)
    }

    function animateHideLinkDelete() {
      if (deleteMorphTimer) clearTimeout(deleteMorphTimer)
      const fromWidth = toolbar.getBoundingClientRect().width
      toolbar.style.width = fromWidth + 'px'
      forceReflow(toolbar)

      linkDeleteBtn.style.opacity = '0'
      linkDeleteBtn.style.transform = 'scale(0.5)'

      const toWidth = measureToolbarWidthWith('none')

      requestAnimationFrame(() => {
        toolbar.style.width = toWidth + 'px'
      })

      deleteMorphTimer = setTimeout(() => {
        linkDeleteBtn.style.display = 'none'
        toolbar.style.width = ''
      }, DELETE_ANIM_MS)
    }

    function updateLinkDeleteVisibility(instant?: boolean) {
      const hasLink = !!(activeTextNode && findFormatAncestor(activeTextNode, formatMatcher('a')))
      const isVisible = linkDeleteBtn.style.display === 'flex'
      if (hasLink === isVisible) return

      if (instant) {
        linkDeleteBtn.style.display = hasLink ? 'flex' : 'none'
        linkDeleteBtn.style.opacity = hasLink ? '1' : '0'
        linkDeleteBtn.style.transform = hasLink ? 'scale(1)' : 'scale(0.5)'
        return
      }

      if (hasLink) animateShowLinkDelete()
      else animateHideLinkDelete()
    }

    function enterLinkMode() {
      const existing = activeTextNode ? findFormatAncestor(activeTextNode, formatMatcher('a')) : null
      linkInput.value = existing ? existing.getAttribute('href') || '' : ''
      updateLinkDeleteVisibility(true)
      morphToolbarTo(mainActions, linkPanel, () => {
        linkInput.focus()
        linkInput.select()
      })
    }

    function exitLinkMode() {
      if (linkPanel.style.display !== 'flex' && getComputedStyle(linkPanel).display === 'none') return
      morphToolbarTo(linkPanel, mainActions)
    }

    function openLinkEditorForAnchor(anchorEl: HTMLElement) {
      const textNode = firstTextNode(anchorEl)
      if (!textNode) return

      const range = document.createRange()
      range.selectNodeContents(textNode)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)

      savedRange = range.cloneRange()
      activeTextNode = textNode

      if (morphTimer) clearTimeout(morphTimer)
      toolbar.style.width = ''
      mainActions.style.display = 'none'
      mainActions.style.opacity = '0'
      mainActions.style.filter = 'blur(0px)'
      linkPanel.style.display = 'flex'
      linkPanel.style.opacity = '1'
      linkPanel.style.filter = 'blur(0px)'

      linkInput.value = anchorEl.getAttribute('href') || ''
      updateLinkDeleteVisibility(true)

      positionToolbar(range)
      syncActiveStates(activeTextNode)

      linkInput.focus()
      linkInput.select()
    }

    // ── Selection / editor listeners ────────────────
    function onEditorMousedownForAnchor(e: MouseEvent) {
      if ((e.target as HTMLElement).closest('a')) e.preventDefault()
    }

    function onEditorClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a')
      if (anchor && editor.contains(anchor)) {
        e.preventDefault()
        openLinkEditorForAnchor(anchor)
      }
    }

    function isWholeTextNode(range: Range): boolean {
      return (
        range.startContainer === range.endContainer &&
        range.startContainer.nodeType === 3 &&
        range.startOffset === 0 &&
        range.endOffset === (range.startContainer as CharacterData).length
      )
    }

    // Commit a range that's already known to be fully within the editor:
    // save it, reflect it as the live selection (so the visible highlight
    // always matches what will actually be formatted), position the
    // toolbar, and derive activeTextNode/active states from it.
    function applySelectionRange(range: Range) {
      savedRange = range.cloneRange()
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      positionToolbar(range)
      activeTextNode = isWholeTextNode(range) ? range.startContainer : null
      syncActiveStates(range.commonAncestorContainer)
    }

    function onEditorMouseUp() {
      setTimeout(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.toString().trim()) return
        const rawRange = sel.getRangeAt(0)

        if (isEditorRange(rawRange)) {
          applySelectionRange(rawRange)
          return
        }

        // Selection overshot the editor (e.g. triple-click extending to
        // the next sibling element) — clamp it to the editor's own bounds
        // and apply that instead of silently doing nothing.
        const clamped = clampRangeToEditor(rawRange)
        if (!clamped) {
          hideToolbar()
          return
        }
        applySelectionRange(clamped)
      }, 10)
    }

    function onDocumentMousedown(e: MouseEvent) {
      const target = e.target as Node
      if (!toolbar.contains(target) && !editor.contains(target)) hideToolbar()
    }

    function onEditorMousedownForDeselect() {
      setTimeout(() => {
        if (document.activeElement === linkInput) return
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed) hideToolbar()
      }, 20)
    }

    editor.addEventListener('mousedown', onEditorMousedownForAnchor)
    editor.addEventListener('mousedown', onEditorMousedownForDeselect)
    editor.addEventListener('click', onEditorClick)
    editor.addEventListener('mouseup', onEditorMouseUp)
    document.addEventListener('mousedown', onDocumentMousedown)

    // ── Toolbar button wiring ───────────────────────
    const tbHandlers = tbButtons.map((btn) => {
      const key = btn.dataset.tbBtn!
      const entry = TB_ORDER.find((t) => t.key === key)!
      const handler = (e: MouseEvent) => {
        e.preventDefault()
        if (entry.tag === 'a') enterLinkMode()
        else toggleFormat(entry.tag)
      }
      btn.addEventListener('mousedown', handler)
      return { btn, handler }
    })

    const onLinkBackMousedown = (e: MouseEvent) => {
      e.preventDefault()
      exitLinkMode()
    }
    linkBackBtn.addEventListener('mousedown', onLinkBackMousedown)

    const onLinkDeleteMousedown = (e: MouseEvent) => {
      e.preventDefault()
      removeLinkFormat()
      exitLinkMode()
    }
    linkDeleteBtn.addEventListener('mousedown', onLinkDeleteMousedown)

    const onLinkInputInput = () => {
      const cursorPos = linkInput.selectionStart
      applyLinkFormat()
      linkInput.focus()
      if (cursorPos !== null) linkInput.setSelectionRange(cursorPos, cursorPos)
    }
    linkInput.addEventListener('input', onLinkInputInput)

    const onLinkInputKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        exitLinkMode()
      }
      if (e.key === 'Escape') exitLinkMode()
    }
    linkInput.addEventListener('keydown', onLinkInputKeydown)

    // ── Tooltips ─────────────────────────────────────
    const OPEN_DELAY = 500
    const WARM_WINDOW = 300
    let openTimer: ReturnType<typeof setTimeout> | null = null
    let warmTimer: ReturnType<typeof setTimeout> | null = null
    let isWarm = false

    function positionTooltip(btn: HTMLElement) {
      const btnRect = btn.getBoundingClientRect()
      const containerRect = toolbar.getBoundingClientRect()
      const gap = 4
      tooltip.style.left = btnRect.left + btnRect.width / 2 + 'px'
      tooltip.style.top = containerRect.top - gap + 'px'
    }

    function showTooltip(btn: HTMLElement, instant: boolean) {
      tooltip.textContent = btn.dataset.tooltip || ''
      tooltip.classList.toggle(styles.tooltipInstant, instant)
      positionTooltip(btn)
      tooltip.style.transform = 'translate(-50%, -100%) scale(0.97)'
      tooltip.classList.remove(styles.tooltipVisible)
      requestAnimationFrame(() => {
        tooltip.style.transform = 'translate(-50%, -100%) scale(1)'
        tooltip.classList.add(styles.tooltipVisible)
      })
      isWarm = true
      if (warmTimer) clearTimeout(warmTimer)
    }

    function hideTooltip() {
      tooltip.classList.remove(styles.tooltipVisible)
      if (openTimer) clearTimeout(openTimer)
      if (warmTimer) clearTimeout(warmTimer)
      warmTimer = setTimeout(() => {
        isWarm = false
      }, WARM_WINDOW)
    }

    const tooltipHandlers = tbButtons.map((btn) => {
      const onEnter = () => {
        if (openTimer) clearTimeout(openTimer)
        if (isWarm) showTooltip(btn, true)
        else openTimer = setTimeout(() => showTooltip(btn, false), OPEN_DELAY)
      }
      const onLeave = () => {
        if (openTimer) clearTimeout(openTimer)
        hideTooltip()
      }
      const onDown = () => {
        if (openTimer) clearTimeout(openTimer)
        tooltip.classList.remove(styles.tooltipVisible)
      }
      btn.addEventListener('mouseenter', onEnter)
      btn.addEventListener('mouseleave', onLeave)
      btn.addEventListener('mousedown', onDown)
      return { btn, onEnter, onLeave, onDown }
    })

    // ── Reset ────────────────────────────────────────
    resetFnRef.current = () => {
      editor.innerHTML = originalHTML
      hideToolbar()
      window.getSelection()?.removeAllRanges()
    }

    return () => {
      editor.removeEventListener('mousedown', onEditorMousedownForAnchor)
      editor.removeEventListener('mousedown', onEditorMousedownForDeselect)
      editor.removeEventListener('click', onEditorClick)
      editor.removeEventListener('mouseup', onEditorMouseUp)
      document.removeEventListener('mousedown', onDocumentMousedown)
      linkBackBtn.removeEventListener('mousedown', onLinkBackMousedown)
      linkDeleteBtn.removeEventListener('mousedown', onLinkDeleteMousedown)
      linkInput.removeEventListener('input', onLinkInputInput)
      linkInput.removeEventListener('keydown', onLinkInputKeydown)
      tbHandlers.forEach(({ btn, handler }) => btn.removeEventListener('mousedown', handler))
      tooltipHandlers.forEach(({ btn, onEnter, onLeave, onDown }) => {
        btn.removeEventListener('mouseenter', onEnter)
        btn.removeEventListener('mouseleave', onLeave)
        btn.removeEventListener('mousedown', onDown)
      })
      if (morphTimer) clearTimeout(morphTimer)
      if (deleteMorphTimer) clearTimeout(deleteMorphTimer)
      if (openTimer) clearTimeout(openTimer)
      if (warmTimer) clearTimeout(warmTimer)
      toolbar.remove()
      tooltip.remove()
    }
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-heading)' }}>
          Text editor
        </span>
        <Button
          variant="outline"
          size="sm"
          icon={<i ref={resetIconRef} className="fa-solid fa-arrow-rotate-right" style={{ fontSize: 12 }} />}
          onClick={handleResetClick}
        >
          Reset styles
        </Button>
      </div>

      <div className="bg-zinc-100 rounded-2xl border border-zinc-100 w-full py-0 px-[clamp(20px,4vw,40px)]">
        <div
          ref={editorRef}
          className={`bg-white cursor-default w-fit max-w-full mx-auto py-10 px-[100px] ${styles.copy}`}
          dangerouslySetInnerHTML={{ __html: EDITOR_HTML }}
        />
      </div>
    </div>
  )
}

export default memo(TextEditorTile)
