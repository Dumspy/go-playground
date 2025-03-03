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
import AuthorForm from "./form";

// Define the Author type based on the model
type Author = components["schemas"]["go-playground_internal_database_models.Author"]

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

const AuthorsTab: React.FC = () => {
  const { api, tanClient } = useApi();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedAuthor, setSelectedAuthor] = React.useState<Author | undefined>(undefined);
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

  // Fetch authors data using the API context
  const {
    data: authors = [],
    isLoading,
    isError,
  } = api.useQuery('get', "/admin/authors");

  const createAuthorMutation = api.useMutation('post', "/admin/authors", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/authors"] });
      setIsFormDialogOpen(false);
      const formData = form.getValues();
      toast("Author created", {
        description: `${formData.first_name} ${formData.last_name} has been added successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to create author. Please try again.",
      });
    }
  });

  const deleteAuthorMutation = api.useMutation('delete', "/admin/authors/{id}", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/authors"] });
      setIsDeleteDialogOpen(false);
      toast("Author deleted", {
        description: `${selectedAuthor?.first_name} ${selectedAuthor?.last_name} has been removed successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to delete author. Please try again.",
      });
    }
  });

  const updateAuthorMutation = api.useMutation('patch', "/admin/authors/{id}", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/authors"] });
      setIsFormDialogOpen(false);
      const formData = form.getValues();
      toast("Author updated", {
        description: `${formData.first_name} ${formData.last_name} has been updated successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to update author. Please try again.",
      });
    }
  });

  // Define columns for the table
  const columns: ColumnDef<Author>[] = [
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
        const author = row.original;
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
                  setSelectedAuthor(author);
                  form.setValue("first_name", author.first_name);
                  form.setValue("last_name", author.last_name);
                  setFormVariant("edit");
                  setIsFormDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAuthor(author);
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
    data: authors,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Create new author
  const handleCreate = (values: z.infer<typeof formSchema>) => {
    createAuthorMutation.mutate({
      body: values,
    });
  };

  // Update existing author
  const handleUpdate = (values: z.infer<typeof formSchema>) => {
    if (!selectedAuthor?.ID) return;
    updateAuthorMutation.mutate({
      params: {
        path: { id: selectedAuthor.ID },
      },
      body: values,
    });
  };

  // Delete author
  const handleDelete = () => {
    if (selectedAuthor?.ID) {
      deleteAuthorMutation.mutate({
        params: {
          path: { id: selectedAuthor.ID }
        }
      });
    }
  };

  if (isLoading) {
    return <TableLoading title="Author" />
  }

  if (isError) {
    return <div>Error loading authors</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Authors</h2>
        <Button onClick={() => {
          form.reset();
          setFormVariant("create");
          setIsFormDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Author
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
                  No authors found.
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
      <AuthorForm variant={formVariant} author={selectedAuthor} onSubmit={formVariant === "create" ? handleCreate : handleUpdate} isOpen={isFormDialogOpen} setIsOpen={setIsFormDialogOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the author {selectedAuthor?.first_name} {selectedAuthor?.last_name}.
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

export default AuthorsTab;