
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Lock, Share } from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 to-cyan-800">
      {/* Header */}
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="text-white text-2xl font-bold">CloudDrop</div>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6 md:text-6xl">
          Secure File Sharing<br />Made Simple
        </h1>
        <p className="text-xl text-sky-100 mb-10 max-w-3xl mx-auto">
          Upload, share, and manage your files with ease. 
          Generate secure links that you control, with optional expiration dates.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="text-lg px-8" asChild>
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 text-lg px-8">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
            <div className="bg-primary/20 p-3 rounded-full w-fit mb-6">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Easy File Upload</h3>
            <p className="text-sky-100">
              Drag and drop your files or browse to upload. Support for various file types with a 50MB limit per file.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
            <div className="bg-primary/20 p-3 rounded-full w-fit mb-6">
              <Share className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Shareable Links</h3>
            <p className="text-sky-100">
              Generate unique URLs for each file that you can share with anyone, even if they don't have an account.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
            <div className="bg-primary/20 p-3 rounded-full w-fit mb-6">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Controlled Access</h3>
            <p className="text-sky-100">
              Set expiration dates for your links or revoke access at any time. You're always in control of your shared files.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start sharing?</h2>
          <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Create an account today and get started with secure file sharing in seconds.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              {isAuthenticated ? "Go to Dashboard" : "Sign Up for Free"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-10">
        <div className="border-t border-white/20 pt-8 text-center text-sky-200">
          <p>© {new Date().getFullYear()} CloudDrop. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link to="#" className="hover:text-white">Terms</Link>
            <Link to="#" className="hover:text-white">Privacy</Link>
            <Link to="#" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
