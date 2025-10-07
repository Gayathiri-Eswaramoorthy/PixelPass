import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageCount, setImageCount] = useState<"4" | "6">("4");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !theme) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/setup-password`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Navigate to image password setup
        navigate("/setup-password", { 
          state: { 
            userId: authData.user.id, 
            imageCount: parseInt(imageCount), 
            theme 
          } 
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            SecureAuth
          </h1>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Create Account</h2>
          <p className="text-muted-foreground">Set up your secure graphical password</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Number of Images</Label>
            <RadioGroup value={imageCount} onValueChange={(val) => setImageCount(val as "4" | "6")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="four" />
                <Label htmlFor="four" className="cursor-pointer">4 Images (Easier)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6" id="six" />
                <Label htmlFor="six" className="cursor-pointer">6 Images (More Secure)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Image Theme</Label>
            <Input
              id="theme"
              placeholder="e.g., animals, fruits, vehicles"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Continue to Setup"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate("/login")}
            className="text-primary"
          >
            Already have an account? Log in
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Register;