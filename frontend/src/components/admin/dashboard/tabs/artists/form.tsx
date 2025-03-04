import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { components } from "@/types/shared-types"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

type Artist = components["schemas"]["go-playground_internal_database_models.Artist"]

interface ArtistFormProps {
  variant: "create" | "edit";
  artist?: Artist;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const ArtistForm: React.FC<ArtistFormProps> = ({ variant, artist, onSubmit, isOpen, setIsOpen }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  const texts = {
    create: {
      title: "Add New Artist",
      description: "Please fill in the details to create a new artist.",
      submit: "Create Artist",
    },
    edit: {
      title: "Edit Artist",
      description: "Please fill in the details to edit the artist.",
      submit: "Update Artist",
    },
  };

  React.useEffect(() => {
    if (isOpen && variant === "edit" && artist) {
      form.reset({
        first_name: artist.first_name,
        last_name: artist.last_name,
      });
    }
  }, [isOpen, variant, artist, form]);

  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }
    , [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{texts[variant].title}</DialogTitle>
          <DialogDescription>
            {texts[variant].description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="first_name">First Name</FormLabel>
                <FormControl>
                  <Input id="first_name" {...field} />
                </FormControl>
                <FormDescription>
                  Please enter the artist's first name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="last_name">Last name</FormLabel>
                <FormControl>
                  <Input id="last_name" {...field} />
                </FormControl>
                <FormDescription>
                  Please enter the artist's last name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit">{texts[variant].submit}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ArtistForm;