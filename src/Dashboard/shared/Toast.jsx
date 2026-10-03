import { motion } from 'framer-motion'
import { IoCheckmarkCircleOutline, IoAlertCircleOutline, IoClose } from 'react-icons/io5'

export default function Toast({ message, type, onDismiss }) {
  const isError = type === 'error'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[12px] px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${
        isError ? 'border border-accent-500/10 bg-white text-accent-500' : 'bg-accent-500 text-white'
      }`}
    >
      {isError ? <IoAlertCircleOutline size={20} /> : <IoCheckmarkCircleOutline size={20} />}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isError ? 'text-accent-500 hover:bg-primary-600' : 'text-white/80 hover:bg-white/10'
        }`}
      >
        <IoClose size={16} />
      </button>
    </motion.div>
  )
}
