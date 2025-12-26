import { Watch2getherLogo } from "./components/Watch2getherLogo";

export default function App() {
  return (
    <div className="size-full bg-gradient-to-br from-purple-50 to-blue-50 overflow-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header with logo */}
        <header className="mb-16">
          <div className="flex items-center justify-center">
            <Watch2getherLogo size="large" />
          </div>
        </header>
        
        {/* Demo section showing different sizes */}
        <section className="bg-white rounded-3xl p-12 shadow-xl mb-12">
          <h2 className="text-center mb-12 text-gray-800">Logo Variations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Large size */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm text-gray-500 mb-2">Large (Default)</div>
              <Watch2getherLogo size="large" />
            </div>
            
            {/* Medium size */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm text-gray-500 mb-2">Medium</div>
              <Watch2getherLogo size="medium" />
            </div>
            
            {/* Small size */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm text-gray-500 mb-2">Small</div>
              <Watch2getherLogo size="small" />
            </div>
          </div>
        </section>
        
        {/* Usage examples */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* On dark background */}
          <div className="bg-gray-900 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-white text-sm mb-6 opacity-60">On Dark Background</div>
            <Watch2getherLogo size="medium" />
          </div>
          
          {/* Navbar example */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-gray-500 text-sm mb-6 text-center">Navbar Example</div>
            <nav className="bg-gray-900 rounded-lg px-6 py-4 flex items-center justify-between">
              <Watch2getherLogo size="small" />
              <div className="flex gap-4">
                <button className="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Rooms
                </button>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow">
                  Create Room
                </button>
              </div>
            </nav>
          </div>
        </section>
        
        {/* Code snippet */}
        <section className="mt-12 bg-gray-900 rounded-2xl p-8 text-white">
          <div className="mb-4 text-sm text-gray-400">Usage in your code:</div>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`import { Watch2getherLogo } from "./components/Watch2getherLogo";

// Use in your component
<Watch2getherLogo size="large" />  // large (default)
<Watch2getherLogo size="medium" /> // medium
<Watch2getherLogo size="small" />  // small
<Watch2getherLogo />               // defaults to large`}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}