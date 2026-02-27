"use client";

export default function AdminDashboardTest() {
  console.log("AdminDashboardTest: Component rendering");
  
  return (
    <div className="min-h-screen bg-background-off p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary mb-4">Admin Dashboard (Test)</h1>
        <p className="text-foreground">If you can see this, the dashboard is working!</p>
        
        <div className="mt-8 p-4 bg-primary border border-border rounded-lg">
          <h2 className="text-lg font-semibold text-secondary mb-2">Test Section</h2>
          <p className="text-sm text-foreground-muted">This is a minimal test version to isolate the loading issue.</p>
        </div>
      </div>
    </div>
  );
}
