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
import { Textarea } from "@/components/ui/textarea";
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
// Add import for Checkbox
import { Checkbox } from "@/components/ui/checkbox";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, ChevronsUpDown, X } from "lucide-react";
import { toast } from "sonner"
import { components } from "@/types/shared-types"
import TableLoading from "./table-loading";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogDescription } from "@radix-ui/react-dialog";
// Add imports for new components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type Cover = components["schemas"]["go-playground_internal_database_models.Cover"];
type Book = components["schemas"]["go-playground_internal_database_models.Book"];
type Artist = components["schemas"]["go-playground_internal_database_models.Artist"];

const formSchema = z.object({
  design_ideas: z.string().min(1, "Design ideas are required"),
  image_url: z.string().optional(),
  book_id: z.number().min(1, "Book is required"),
  artist_ids: z.array(z.number()).min(1, "At least one artist is required"),
});

// Create a helper function to ensure we have valid artist IDs
const getValidArtistIds = (artists?: Artist[]) => {
  if (!artists || !Array.isArray(artists)) return [];
  return artists.map((artist) => artist.ID).filter((id): id is number => id !== undefined);
};

const CoversTab: React.FC = () => {
  const { api, tanClient } = useApi();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedCover, setSelectedCover] = React.useState<Cover | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      design_ideas: "",
      image_url: "",
      book_id: undefined,
      artist_ids: [],
    },
  });

  const {
    data: covers = [],
    isLoading,
    isError,
  } = api.useQuery('get', "/admin/covers");

  const {
    data: books = [],
  } = api.useQuery('get', "/admin/books");

  const {
     data: artists = [],
  } = api.useQuery('get', "/admin/artists");


  const createCoverMutation = api.useMutation('post', "/admin/covers", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/covers"] });
      setIsCreateDialogOpen(false);
      toast("Cover created", {
        description: `Cover has been added successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to create cover. Please try again.",
      });
    }
  });

  const deleteCoverMutation = api.useMutation('delete', "/admin/covers/{id}", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/covers"] });
      setIsDeleteDialogOpen(false);
      toast("Cover deleted", {
        description: `Cover has been removed successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to delete cover. Please try again.",
      });
    }
  });

  const updateCoverMutation = api.useMutation('patch', "/admin/covers/{id}", {
    onSuccess: () => {
      tanClient.invalidateQueries({ queryKey: ['get', "/admin/covers"] });
      setIsEditDialogOpen(false);
      toast("Cover updated", {
        description: `Cover has been updated successfully.`,
      });
    },
    onError: () => {
      toast("Error", {
        description: "Failed to update cover. Please try again.",
      });
    }
  });

  const columns: ColumnDef<Cover>[] = [
    {
      accessorKey: "ID",
      header: "ID",
    },
    {
      accessorKey: "design_ideas",
      header: "Design Ideas",
      cell: ({ row }) => {
        const designIdeas = row.original.design_ideas?.String;
        return designIdeas || "-";
      }
    },
    {
      accessorKey: "image_url",
      header: "Image URL",
      cell: ({ row }) => {
        const imageUrl = row.original.image_url?.String;
        return imageUrl ? (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            View Image
          </a>
        ) : "-";
      }
    },
    {
      accessorKey: "book_id",
      header: "Book",
      cell: ({ row }) => {
        const bookId = row.original.book_id;
        const book = books.find((book: Book) => book.ID === bookId);
        return book ? book.title : `Book ID: ${bookId}`;
      }
    },
    {
      accessorKey: "Artists",
      header: "Artists",
      cell: ({ row }) => {
        const coverArtists = row.original.Artists || [];
        return coverArtists.length > 0
          ? coverArtists.map((artist: Artist) => `${artist.first_name} ${artist.last_name}`).join(", ")
          : "-";
      }
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
        const cover = row.original;
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
                  setSelectedCover(cover);
                  form.reset({
                    design_ideas: cover.design_ideas?.String || "",
                    image_url: cover.image_url?.String || "",
                    book_id: cover.book_id || 0,
                    artist_ids: getValidArtistIds(cover.Artists),
                  });
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCover(cover);
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
    data: covers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const handleCreate = (values: z.infer<typeof formSchema>) => {
    createCoverMutation.mutate({
      body: values,
    });
  };

  const handleUpdate = (values: z.infer<typeof formSchema>) => {
    if (!selectedCover?.ID) return;
    updateCoverMutation.mutate({
      params: {
        path: { id: selectedCover.ID },
      },
      body: values,
    });
  };

  const handleDelete = () => {
    if (selectedCover?.ID) {
      deleteCoverMutation.mutate({
        params: {
          path: { id: selectedCover.ID }
        }
      });
    }
  };

  if (isLoading) {
    return <TableLoading title="Cover" columnCount={8} hasActions />
  }

  if (isError) {
    return <div>Error loading covers</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Covers</h2>
        <Button onClick={() => {
          form.reset();
          setIsCreateDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Cover
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
                  No covers found.
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Cover</DialogTitle>
            <DialogDescription>
              Please fill in the details to create a new cover.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="grid gap-4 py-4">
              <FormField control={form.control} name="design_ideas" render={({ field }) => (
                <FormItem>
                  <FormLabel>Design Ideas</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="image_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="book_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Book</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value="">Select a book</option>
                      {books.map((book: Book) => (
                        <option
                          key={book.ID}
                          value={book.ID}
                        >
                          {book.title}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="artist_ids" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Artists</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value.length && "text-muted-foreground"
                          )}
                        >
                          {field.value.length > 0 
                            ? `${field.value.length} artist${field.value.length > 1 ? "s" : ""} selected`
                            : "Select artists"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[300px] p-0">
                      <div className="border-b border-border p-2 font-medium">
                        Select Artists
                      </div>
                      <ScrollArea className="h-72 max-h-[300px]">
                        {artists.map((artist) => (
                          <div
                            key={artist.ID}
                            className="flex items-center space-x-2 p-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              const selected = artist.ID !== undefined && field.value.includes(artist.ID)
                                ? field.value.filter((id) => id !== artist.ID)
                                : [...field.value, artist.ID as number];
                              field.onChange(selected);
                            }}
                          >
                            <Checkbox
                              checked={artist.ID !== undefined && field.value.includes(artist.ID)}
                              className="mr-2 h-4 w-4"
                            />
                            <span>{artist.first_name} {artist.last_name}</span>
                          </div>
                        ))}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value.map((artistId) => {
                      const artist = artists.find((artist) => artist.ID === artistId);
                      return (
                        <Badge key={artistId} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                          <span>{artist?.first_name} {artist?.last_name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                            onClick={() => {
                              const selected = field.value.filter((id) => id !== artistId);
                              field.onChange(selected);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cover</DialogTitle>
            <DialogDescription>
              Please update the details to edit the cover.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="grid gap-4 py-4">
              <FormField control={form.control} name="design_ideas" render={({ field }) => (
                <FormItem>
                  <FormLabel>Design Ideas</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="image_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="book_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Book</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value="">Select a book</option>
                      {books.map((book: Book) => (
                        <option
                          key={book.ID}
                          value={book.ID}
                        >
                          {book.title}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="artist_ids" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Artists</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value.length && "text-muted-foreground"
                          )}
                        >
                          {field.value.length > 0 
                            ? `${field.value.length} artist${field.value.length > 1 ? "s" : ""} selected`
                            : "Select artists"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[300px] p-0">
                      <div className="border-b border-border p-2 font-medium">
                        Select Artists
                      </div>
                      <ScrollArea className="h-72 max-h-[300px]">
                        {artists.map((artist) => (
                          <div
                            key={artist.ID}
                            className="flex items-center space-x-2 p-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              const selected = artist.ID !== undefined && field.value.includes(artist.ID)
                                ? field.value.filter((id) => id !== artist.ID)
                                : [...field.value, artist.ID as number];
                              field.onChange(selected);
                            }}
                          >
                            <Checkbox
                              checked={artist.ID !== undefined && field.value.includes(artist.ID)}
                              className="mr-2 h-4 w-4"
                            />
                            <span>{artist.first_name} {artist.last_name}</span>
                          </div>
                        ))}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value.map((artistId) => {
                      const artist = artists.find((artist) => artist.ID === artistId);
                      return (
                        <Badge key={artistId} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                          <span>{artist?.first_name} {artist?.last_name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                            onClick={() => {
                              const selected = field.value.filter((id) => id !== artistId);
                              field.onChange(selected);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
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
              This will permanently delete the cover.
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

export default CoversTab;