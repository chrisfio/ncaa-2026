import { Suspense } from 'react'
import { getTrackerData } from '@/lib/espn'
import AutoRefresh from '@/components/AutoRefresh'
import TrackerView from '@/components/TrackerView'

async function TrackerContent() {
  const data = await getTrackerData()
  return <TrackerView data={data} />
}

export default function Page() {
  return (
    <>
      <AutoRefresh />
      <Suspense fallback={<LoadingState />}>
        <TrackerContent />
      </Suspense>
    </>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading tournament data…</p>
    </div>
  )
}
