import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, Check } from "lucide-react";
import { hashImageSequence } from "@/lib/crypto";

const SetupPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, imageCount, theme } = location.state || {};
  
  const [images, setImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !imageCount || !theme) {
      navigate("/register");
      return;
    }
    generateImages();
  }, []);

  const generateImages = async () => {
    setLoading(true);
    try {
      const gridSize = imageCount === 4 ? 16 : 36;
      const { data, error } = await supabase.functions.invoke('generate-images', {
        body: { theme, count: gridSize }
      });

      if (error) throw error;
      setImages(data.images);
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast.error("Failed to generate images");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: string) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(selectedImages.filter(img => img !== image));
    } else if (selectedImages.length < imageCount) {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const handleSubmit = async () => {
    if (selectedImages.length !== imageCount) {
      toast.error(`Please select exactly ${imageCount} images`);
      return;
    }

    setLoading(true);
    try {
      const imageSequence = selectedImages;
      
      // Hash the image sequence before storing
      const hashedSequence = await hashImageSequence(imageSequence);
      
      const { error } = await supabase
        .from('image_passwords')
        .insert({
          user_id: userId,
          image_count: imageCount,
          theme,
          image_sequence: [hashedSequence] // Store as single hash in array
        });

      if (error) throw error;

      toast.success("Password setup complete!");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to save password");
    } finally {
      setLoading(false);
    }
  };

  const gridCols = imageCount === 4 ? "grid-cols-4" : "grid-cols-6";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Card className="w-full max-w-4xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Setup Your Password
          </h1>
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg">Select {imageCount} images in order</p>
          <p className="text-sm text-muted-foreground">
            Selected: {selectedImages.length}/{imageCount}
          </p>
        </div>

        <div className={`grid ${gridCols} gap-4`}>
          {images.map((image, index) => {
            const isSelected = selectedImages.includes(image);
            const selectionOrder = selectedImages.indexOf(image) + 1;
            
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

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={generateImages}
            disabled={loading}
            className="flex-1"
          >
            Regenerate Images
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedImages.length !== imageCount || loading}
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete Setup
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SetupPassword;