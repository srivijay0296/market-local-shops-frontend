import { useEffect, useState } from 'react';
import { productService } from '@/services/api';
import { useRealtime } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductManager() {
  const [loading, setLoading] = useState(true);
  const { data: products, setData: setProducts } = useRealtime('products');

  useEffect(() => {
    async function load() {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (error: any) {
        toast.error('Failed to load products: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await productService.updateProduct(id, { is_approved: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'approved' : 'suspended'}`);
    } catch (error: any) {
      toast.error('Update failed: ' + error.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
    } catch (error: any) {
      toast.error('Delete failed: ' + error.message);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-emerald-500" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Inventory</h1>
          <p className="text-muted-foreground">Manage and approve products across all shops.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {product.image_url && <img src={product.image_url} className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <div>{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.shops?.name || 'Independent'}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>
                    <Badge variant={product.is_approved ? 'success' : 'secondary'} className={product.is_approved ? 'bg-emerald-100 text-emerald-700' : ''}>
                      {product.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleApproval(product.id, product.is_approved)}
                    >
                      {product.is_approved ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-emerald-500" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
