import { AnimatePresence, motion } from 'framer-motion'
import { IoClose } from 'react-icons/io5'
import useBodyScrollLock from './useBodyScrollLock'

export default function Modal({ isOpen, onClose, title, children }) {
  useBodyScrollLock(isOpen)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="flex max-h-[calc(100dvh-2rem)] w-full flex-col rounded-t-[28px] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:max-w-lg sm:rounded-[24px]"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="flex items-center justify-between border-b border-accent-500/10 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold text-main">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-secondary hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  <IoClose size={20} />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}