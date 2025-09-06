import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMEg0MFY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWYyYTM1IiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-20" />
      
      {/* Glow Effects */}
      <div className="absolute -left-20 -top-20 w-64 h-64 bg-purple-600 rounded-full filter blur-[100px] opacity-10" />
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600 rounded-full filter blur-[100px] opacity-10" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
            PORTFOLIO ADMIN
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-wider">SECURE ACCESS PANEL</p>
        </div>
        
        {/* SignIn Card */}
        <div className="relative">
          {/* Neon Border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-75 animate-pulse" />
          
          <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-8 backdrop-blur-sm">            
            {/* Clerk SignIn */}
            <div className="clerk-signin-wrapper">
              <SignIn 
                appearance={{
                  elements: {
                    card: "bg-white shadow-lg rounded-lg p-6 w-full",
                    formFieldInput: "bg-gray-100 border-gray-300 text-black placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
                    formFieldLabel: "text-gray-700 text-xs font-mono uppercase tracking-wider",
                    formButtonPrimary: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-mono tracking-wider rounded-md",
                    footerActionText: "text-gray-600 text-xs font-mono",
                    footerActionLink: "text-purple-600 hover:text-purple-500 font-mono",
                    identityPreviewText: "text-gray-900",
                  }
                }}
                redirectUrl="/" 
              />

            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .clerk-signin-wrapper .cl-formButtonPrimary {
          height: 2.75rem;
          letter-spacing: 0.05em;
        }
        .clerk-signin-wrapper .cl-formFieldInput {
          height: 2.75rem;
          border-radius: 0.125rem;
        }
        .clerk-signin-wrapper .cl-formFieldRow {
          margin-bottom: 1.25rem;
        }
        .clerk-signin-wrapper .cl-internal-11ewti4 {
          color: white;
        }
        .clerk-signin-wrapper .cl-internal-1d6wktc {
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
}