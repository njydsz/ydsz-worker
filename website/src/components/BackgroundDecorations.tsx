export default function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-yuanbao-500/[0.06] rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yuanbao-600/[0.04] rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -left-[300px] w-[500px] h-[500px] bg-yuanbao-500/[0.02] rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-[200px] w-[400px] h-[400px] bg-yuanbao-400/[0.03] rounded-full blur-[80px]" />
    </div>
  )
}
