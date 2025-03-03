import React from "react";
import { useApi } from "@/context/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel
} from "@tanstack/react-table";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner"
import { components } from "@/types/shared-types"
import TableLoading from "./table-loading";
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
import { DialogDescription } from "@radix-ui/react-dialog";

// Define the Artist type based on the model
type Artist = components["schemas"]["go-playground_internal_database_models.Artist"]

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

const ArtistsTab: React.FC = () => {
  const { api, tanClient } = useApi();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedArtist, setSelectedArtist] = React.useState<Artist | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  // Fetch artists data using the API context
  const {
    data: artists = [],
    isLoading,
    isError,
  } = api.useQuery('get', "/admin/artists");

  const createArtistMutation = api.useMutation('post', "/admin/artists", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/artists"] });
      setIsCreateDialogOpen(false);
      const formData = form.getValues();
      toast("Artist created", {
        description: `${formData.first_name} ${formData.last_name} has been added successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to create artist. Please try again.",
      });
    }
  });

  const deleteArtistMutation = api.useMutation('delete', "/admin/artists/{id}", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/artists"] });
      setIsDeleteDialogOpen(false);
      toast("Artist deleted", {
        description: `${selectedArtist?.first_name} ${selectedArtist?.last_name} has been removed successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to delete artist. Please try again.",
      });
    }
  });

  const updateArtistMutation = api.useMutation('patch', "/admin/artists/{id}", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/artists"] });
      setIsEditDialogOpen(false);
      const formData = form.getValues();
      toast("Artist updated", {
        description: `${formData.first_name} ${formData.last_name} has been updated successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to update artist. Please try again.",
      });
    }
  });

  // Define columns for the table
  const columns: ColumnDef<Artist>[] = [
    {
      accessorKey: "ID",
      header: "ID",
    },
    {
      accessorKey: "first_name",
      header: "First Name",
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
    },
    {
      accessorKey: "CreatedAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("CreatedAt"));
        return date.toLocaleDateString();
      }
    },
    {
      accessorKey: "UpdatedAt",
      header: "Updated At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("UpdatedAt"));
        return date.toLocaleDateString();
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const artist = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedArtist(artist);
                  form.setValue("first_name", artist.first_name);
                  form.setValue("last_name", artist.last_name);
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedArtist(artist);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: artists,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Create new artist
  const handleCreate = (values: z.infer<typeof formSchema>) => {
    createArtistMutation.mutate({
      body: values,
    });
  };

  // Update existing artist
  const handleUpdate = (values: z.infer<typeof formSchema>) => {
    if (!selectedArtist?.ID) return;
    updateArtistMutation.mutate({
      params: {
        path: { id: selectedArtist.ID },
      },
      body: values,
    });
  };

  // Delete artist
  const handleDelete = () => {
    if (selectedArtist?.ID) {
      deleteArtistMutation.mutate({
        params: {
          path: { id: selectedArtist.ID }
        }
      });
    }
  };

  if (isLoading) {
    return <TableLoading title="Artist" />
  }

  if (isError) {
    return <div>Error loading artists</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Artists</h2>
        <Button onClick={() => {
          form.reset();
          setIsCreateDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Artist
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No artists found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Artist</DialogTitle>
            <DialogDescription>
              Please fill in the details to create a new artist.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="grid gap-4 py-4">
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
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Artist</DialogTitle>
            <DialogDescription>
              Please update the details to edit the artist.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="grid gap-4 py-4">
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
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the artist {selectedArtist?.first_name} {selectedArtist?.last_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArtistsTab;