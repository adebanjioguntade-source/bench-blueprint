'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { exportUserData, deleteUserAccount } from '@/app/actions/account'

export default function AccountPage() {
  const router = useRouter()
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isExportPending, setIsExportPending] = useState(false)

  const handleExport = async () => {
    setErrorMsg('')
    setSuccessMsg('')
    setIsExportPending(true)

    try {
      const res = await exportUserData()
      if (res.success && res.data) {
        const jsonStr = JSON.stringify(res.data, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `bench_blueprint_backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setSuccessMsg('Your data archive has been compiled and downloaded.')
      } else {
        setErrorMsg(res.error || 'Failed to export your data.')
      }
    } catch {
      setErrorMsg('An unexpected error occurred during export.')
    } finally {
      setIsExportPending(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (deleteConfirm !== 'DELETE') {
      setErrorMsg('Please type DELETE in capitals to confirm account deletion.')
      return
    }

    startTransition(async () => {
      const res = await deleteUserAccount()
      if (res.success) {
        router.push('/login?info=account-deleted')
        router.refresh()
      } else {
        setErrorMsg(res.error || 'Failed to delete your account.')
      }
    })
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-12 md:py-20 bg-background space-y-8">
      <header className="border-b border-border pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Profile Management
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif mt-2">
          Account Settings
        </h1>
      </header>

      {errorMsg && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-md">
          {successMsg}
        </div>
      )}

      {/* Export Section */}
      <section className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-foreground font-serif border-b border-border pb-2">
          Data Portability (GDPR/CCPA)
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Download a complete, machine-readable JSON archive of all your workbook progress, answers, diagnostic history, and profile details.
        </p>
        <button
          onClick={handleExport}
          disabled={isExportPending || isPending}
          className="px-4 py-2 bg-primary hover:opacity-90 text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-opacity"
        >
          {isExportPending ? 'Exporting...' : 'Export Workbook Data (JSON)'}
        </button>
      </section>

      {/* Danger Zone: Delete Section */}
      <section className="bg-card border border-destructive/20 dark:border-destructive/30 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-destructive font-serif border-b border-destructive/10 pb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Permanently delete your account. This action will immediately and irreversibly delete your profile, diagnostic leads record, and all 16-section entries.
        </p>

        <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="confirmDelete" className="block text-xs font-semibold text-foreground">
              To confirm, type <strong className="text-destructive font-mono">DELETE</strong> below:
            </label>
            <input
              id="confirmDelete"
              type="text"
              required
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="block w-full sm:max-w-xs px-3 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-destructive focus:border-destructive"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isExportPending}
            className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-opacity"
          >
            {isPending ? 'Deleting...' : 'Delete My Account and Data'}
          </button>
        </form>
      </section>

      <footer className="pt-6 border-t border-border flex justify-between items-center text-xs">
        <Link href="/dashboard" className="font-semibold text-muted-foreground hover:text-foreground">
          &larr; Return to Dashboard
        </Link>
        <span className="text-muted-foreground">
          The Bench Blueprint™
        </span>
      </footer>
    </main>
  )
}
