import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { loginSchema } from "@/lib/validation";
import { hashImageSequence, constantTimeCompare } from "@/lib/crypto";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "images">("credentials");
  const [userId, setUserId] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState<any>(null);
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<{ url: string; order: number }[]>([]);
  const [storedSequence, setStoredSequence] = useState<string[]>([]);
  const [requiredImageCount, setRequiredImageCount] = useState(4);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/dashboard");
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      toast.error(errors);
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        toast.error("Email or password is incorrect");
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { data: pwData, error: pwError } = await supabase
          .from('image_passwords')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (pwError || !pwData) {
          toast.error("No graphical password found");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        setUserId(authData.user.id);
        setPasswordData(pwData);
        setRequiredImageCount(pwData.image_count);
        
        // Store the hashed sequence from the database
        setStoredSequence(pwData.image_sequence);

        // Generate images and shuffle
        const { data: imgData, error: imgError } = await supabase.functions.invoke('generate-images', {
          body: { theme: pwData.theme, count: pwData.image_count === 4 ? 16 : 36 }
        });

        if (imgError) throw imgError;

        const shuffled = [...imgData.images].sort(() => Math.random() - 0.5);
        setShuffledImages(shuffled);
        setStep("images");
      }
    } catch (error: any) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: string) => {
    const existingIndex = selectedImages.findIndex(img => img.url === image);
    
    if (existingIndex !== -1) {
      // Remove image and reorder remaining
      setSelectedImages(selectedImages.filter(img => img.url !== image));
    } else if (selectedImages.length < requiredImageCount) {
      // Add new image
      setSelectedImages([...selectedImages, { url: image, order: selectedImages.length + 1 }]);
    }
  };

  const handleImageSubmit = async () => {
    if (selectedImages.length !== requiredImageCount) {
      toast.error(`Please select exactly ${requiredImageCount} images in order`);
      return;
    }

    setLoading(true);
    try {
      const selectedSequence = selectedImages.map(img => img.url);
      const selectedHash = await hashImageSequence(selectedSequence);
      
      // The stored sequence is already a hash (single element array with hash)
      const storedHash = storedSequence[0];
      
      // Use constant-time comparison to prevent timing attacks
      if (constantTimeCompare(selectedHash, storedHash)) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Incorrect image sequence. Please try again.");
        setSelectedImages([]);
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const gridCols = requiredImageCount === 4 ? "grid-cols-4" : "grid-cols-6";

  if (step === "images") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Card className="w-full max-w-4xl p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Select Your Images
            </h1>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg">Select {requiredImageCount} images in the correct order</p>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedImages.length}/{requiredImageCount}
            </p>
          </div>

          <div className={`grid ${gridCols} gap-4`}>
            {shuffledImages.map((image, index) => {
              const selectedItem = selectedImages.find(img => img.url === image);
              const isSelected = !!selectedItem;
              const selectionOrder = selectedItem?.order || 0;

              return (
                <button
                  key={index}
                  onClick={() => handleImageClick(image)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    isSelected ? 'border-primary shadow-lg shadow-primary/50' : 'border-border'
                  }`}
                >
                  <img src={image} alt={`Option ${index + 1}`} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {selectionOrder}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleImageSubmit}
            disabled={selectedImages.length !== requiredImageCount || loading}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </Card>
      </div>
    );
  }

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
          <h2 className="text-2xl font-semibold">Welcome Back</h2>
          <p className="text-muted-foreground">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <div className="space-y-2 text-center">
          <Button
            variant="link"
            onClick={() => navigate("/forgot-password")}
            className="text-primary"
          >
            Forgot your password?
          </Button>
          <div>
            <Button
              variant="link"
              onClick={() => navigate("/register")}
              className="text-primary"
            >
              Don't have an account? Register
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
