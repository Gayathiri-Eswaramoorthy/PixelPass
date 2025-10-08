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
import { resetPasswordSchema } from "@/lib/validation";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [imageCount, setImageCount] = useState<"4" | "6">("4");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const validation = resetPasswordSchema.safeParse({
      password,
      imageCount,
      theme,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      toast.error(errors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        navigate("/setup-password", {
          state: {
            userId: user.id,
            imageCount: parseInt(imageCount),
            theme,
            isReset: true
          }
        });
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password");
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
            Create New Password
          </h1>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Reset Your Security</h2>
          <p className="text-muted-foreground">Set up a new password and graphical pattern</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
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
                Resetting...
              </>
            ) : (
              "Continue to Setup"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;