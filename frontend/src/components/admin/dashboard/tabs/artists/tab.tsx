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
import TableLoading from "../table-loading";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import ArtistForm from "./form";

// Define the Artist type based on the model
type Artist = components["schemas"]["go-playground_internal_database_models.Artist"]

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

const ArtistsTab: React.FC = () => {
  const { api, tanClient } = useApi();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedArtist, setSelectedArtist] = React.useState<Artist | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [formVariant, setFormVariant] = React.useState<"create" | "edit">("create");

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
      setIsFormDialogOpen(false);
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
      setIsFormDialogOpen(false);
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
                  setFormVariant("edit");
                  setIsFormDialogOpen(true);
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
          setFormVariant("create");
          setIsFormDialogOpen(true);
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

      {/* Create/Edit Dialog */}
      <ArtistForm variant={formVariant} artist={selectedArtist} onSubmit={handleCreate} isOpen={isFormDialogOpen} setIsOpen={setIsFormDialogOpen}/>

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