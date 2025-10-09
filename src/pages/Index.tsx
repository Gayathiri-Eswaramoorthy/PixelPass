import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Image, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-16 h-16 text-primary animate-pulse" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            PixelPass
          </h1>
        </div>
        <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
          Next-Generation Visual Authentication
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Secure your account with image-based password authentication that's both secure and memorable
        </p>

        <div className="flex gap-4 justify-center pt-6">
          <Button 
            size="lg" 
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8"
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/login")}
            className="text-lg px-8"
          >
            Login
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
        <div className="text-center space-y-3 p-6 rounded-lg bg-card/50 backdrop-blur">
          <div className="flex justify-center">
            <Image className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Visual Memory</h3>
          <p className="text-muted-foreground">
            Images are easier to remember than complex passwords
          </p>
        </div>

        <div className="text-center space-y-3 p-6 rounded-lg bg-card/50 backdrop-blur">
          <div className="flex justify-center">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Enhanced Security</h3>
          <p className="text-muted-foreground">
            Resistant to keyloggers and shoulder surfing attacks
          </p>
        </div>

        <div className="text-center space-y-3 p-6 rounded-lg bg-card/50 backdrop-blur">
          <div className="flex justify-center">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Easy to Use</h3>
          <p className="text-muted-foreground">
            Simple setup with your choice of image themes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
