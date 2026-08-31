import { Link } from "react-router-dom";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { BookOpen } from "lucide-react";

export function Login() {
  return (
    <div className="flex w-full min-h-screen bg-white">
      {/* Left Form Side */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 text-primary-700 mb-8">
            <BookOpen className="w-8 h-8" />
            <span className="text-2xl font-bold">EduLMS</span>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-navy-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-navy-500">
            Please enter your details to access your instructor dashboard.
          </p>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-navy-700">
                  Email address
                </label>
                <div className="mt-2">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700">
                  Password
                </label>
                <div className="mt-2">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-navy-300 text-primary-600 focus:ring-primary-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-navy-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/instructor" className="w-full">
                  <Button className="w-full" size="lg">Log In</Button>
                </Link>
                
                <Button variant="outline" className="w-full" size="lg">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </form>
            
            <p className="mt-8 text-center text-sm text-navy-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="relative hidden w-0 flex-1 lg:block bg-navy-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center bg-gradient-to-br from-primary-900 to-navy-900">
          <div className="max-w-md">
            <h3 className="text-3xl font-bold mb-4">Empower Learners Worldwide</h3>
            <p className="text-primary-100 text-lg mb-8">
              Join thousands of instructors who are sharing their knowledge and building their professional teaching business on EduLMS.
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">5M+</div>
                <div className="text-sm text-primary-200">Active Learners</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">10k+</div>
                <div className="text-sm text-primary-200">Organizations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
