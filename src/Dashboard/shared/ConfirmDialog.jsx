import { AnimatePresence, motion } from 'framer-motion'
import useBodyScrollLock from './useBodyScrollLock'

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  blocked = false,
  dismissLabel = 'Got it',
}) {
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
            onClick={onCancel}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-label={title}
              className="w-full rounded-t-[28px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:max-w-sm sm:rounded-[24px]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-main">{title}</h2>
              {description && <p className="mt-2 text-sm text-trenary">{description}</p>}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {blocked ? (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    {dismissLabel}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onCancel}
                      className="rounded-[12px] border border-accent-500/10 px-4 py-2.5 text-sm font-medium text-secondary hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      {cancelLabel}
                    </button>
                    <button
                      type="button"
                      onClick={onConfirm}
                      className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      {confirmLabel}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}