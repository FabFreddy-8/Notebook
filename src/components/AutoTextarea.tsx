import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react'

/** A textarea that grows to fit its content. */
export default function AutoTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [props.value])

  return <textarea ref={ref} rows={3} {...props} />
}
