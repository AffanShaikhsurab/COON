/**
 * Large Dart Code Samples for Realistic COON Compression Testing
 * 
 * These samples are 1000+ lines to properly test compression efficiency.
 * COON compression makes the most sense with larger files.
 */

import type { CodeSampleSource, CodeComplexity } from './types.js';

// ============================================================
// Large Flutter App Samples (1000+ Lines)
// ============================================================

export const LARGE_FLUTTER_APP_1: CodeSampleSource = {
  id: 'large-ecommerce-app',
  name: 'E-Commerce Product Listing App',
  dartCode: `import 'package:flutter/material.dart';

class ECommerceApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'E-Commerce Store',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: ProductListingPage(),
    );
  }
}

class ProductListingPage extends StatefulWidget {
  @override
  _ProductListingPageState createState() => _ProductListingPageState();
}

class _ProductListingPageState extends State<ProductListingPage> {
  List<Product> products = [];
  List<Product> filteredProducts = [];
  String searchQuery = '';
  String selectedCategory = 'All';
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadProducts();
  }

  void loadProducts() {
    // Simulate loading products
    Future.delayed(Duration(seconds: 1), () {
      setState(() {
        products = _generateDemoProducts();
        filteredProducts = products;
        isLoading = false;
      });
    });
  }

  List<Product> _generateDemoProducts() {
    return [
      Product(
        id: '1',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        category: 'Electronics',
        imageUrl: 'https://example.com/headphones.jpg',
        rating: 4.5,
        reviews: 234,
        inStock: true,
      ),
      Product(
        id: '2',
        name: 'Smart Watch',
        description: 'Fitness tracking smartwatch with heart rate monitor',
        price: 299.99,
        category: 'Electronics',
        imageUrl: 'https://example.com/smartwatch.jpg',
        rating: 4.7,
        reviews: 456,
        inStock: true,
      ),
      Product(
        id: '3',
        name: 'Running Shoes',
        description: 'Comfortable running shoes for daily exercise',
        price: 89.99,
        category: 'Sports',
        imageUrl: 'https://example.com/shoes.jpg',
        rating: 4.3,
        reviews: 189,
        inStock: true,
      ),
      Product(
        id: '4',
        name: 'Coffee Maker',
        description: 'Programmable coffee maker with thermal carafe',
        price: 79.99,
        category: 'Home',
        imageUrl: 'https://example.com/coffee.jpg',
        rating: 4.6,
        reviews: 312,
        inStock: false,
      ),
      Product(
        id: '5',
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat with carrying strap',
        price: 34.99,
        category: 'Sports',
        imageUrl: 'https://example.com/yoga.jpg',
        rating: 4.4,
        reviews: 278,
        inStock: true,
      ),
      Product(
        id: '6',
        name: 'Blender',
        description: 'High-speed blender for smoothies and soups',
        price: 129.99,
        category: 'Home',
        imageUrl: 'https://example.com/blender.jpg',
        rating: 4.8,
        reviews: 523,
        inStock: true,
      ),
      Product(
        id: '7',
        name: 'Camera Lens',
        description: 'Professional 50mm camera lens',
        price: 499.99,
        category: 'Electronics',
        imageUrl: 'https://example.com/lens.jpg',
        rating: 4.9,
        reviews: 167,
        inStock: true,
      ),
      Product(
        id: '8',
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        price: 45.99,
        category: 'Home',
        imageUrl: 'https://example.com/lamp.jpg',
        rating: 4.2,
        reviews: 89,
        inStock: true,
      ),
      Product(
        id: '9',
        name: 'Backpack',
        description: 'Water-resistant backpack with laptop compartment',
        price: 69.99,
        category: 'Accessories',
        imageUrl: 'https://example.com/backpack.jpg',
        rating: 4.5,
        reviews: 412,
        inStock: true,
      ),
      Product(
        id: '10',
        name: 'Water Bottle',
        description: 'Insulated water bottle keeps drinks cold for 24 hours',
        price: 29.99,
        category: 'Sports',
        imageUrl: 'https://example.com/bottle.jpg',
        rating: 4.6,
        reviews: 634,
        inStock: true,
      ),
    ];
  }

  void filterProducts(String query) {
    setState(() {
      searchQuery = query;
      _applyFilters();
    });
  }

  void selectCategory(String category) {
    setState(() {
      selectedCategory = category;
      _applyFilters();
    });
  }

  void _applyFilters() {
    List<Product> temp = products;

    if (searchQuery.isNotEmpty) {
      temp = temp.where((p) => 
        p.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().contains(searchQuery.toLowerCase())
      ).toList();
    }

    if (selectedCategory != 'All') {
      temp = temp.where((p) => p.category == selectedCategory).toList();
    }

    filteredProducts = temp;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Product Catalog'),
        actions: [
          IconButton(
            icon: Icon(Icons.shopping_cart),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => CartPage()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search products...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
              ),
              onChanged: filterProducts,
            ),
          ),
          Container(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              children: [
                CategoryChip(
                  label: 'All',
                  isSelected: selectedCategory == 'All',
                  onTap: () => selectCategory('All'),
                ),
                SizedBox(width: 8),
                CategoryChip(
                  label: 'Electronics',
                  isSelected: selectedCategory == 'Electronics',
                  onTap: () => selectCategory('Electronics'),
                ),
                SizedBox(width: 8),
                CategoryChip(
                  label: 'Sports',
                  isSelected: selectedCategory == 'Sports',
                  onTap: () => selectCategory('Sports'),
                ),
                SizedBox(width: 8),
                CategoryChip(
                  label: 'Home',
                  isSelected: selectedCategory == 'Home',
                  onTap: () => selectCategory('Home'),
                ),
                SizedBox(width: 8),
                CategoryChip(
                  label: 'Accessories',
                  isSelected: selectedCategory == 'Accessories',
                  onTap: () => selectCategory('Accessories'),
                ),
              ],
            ),
          ),
          Expanded(
            child: isLoading
                ? Center(child: CircularProgressIndicator())
                : filteredProducts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'No products found',
                              style: TextStyle(fontSize: 18, color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: EdgeInsets.all(16),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.7,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                        ),
                        itemCount: filteredProducts.length,
                        itemBuilder: (context, index) {
                          return ProductCard(product: filteredProducts[index]);
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class CategoryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const CategoryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue : Colors.grey[200],
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ProductDetailPage(product: product),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                  color: Colors.grey[300],
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Icon(Icons.image, size: 48, color: Colors.grey[400]),
                    ),
                    if (!product.inStock)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Out of Stock',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.star, size: 14, color: Colors.amber),
                      SizedBox(width: 4),
                      Text(
                        product.rating.toString(),
                        style: TextStyle(fontSize: 12),
                      ),
                      SizedBox(width: 4),
                      Text(
                        '(\${product.reviews})',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    '\$\${product.price.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ProductDetailPage extends StatefulWidget {
  final Product product;

  const ProductDetailPage({required this.product});

  @override
  _ProductDetailPageState createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  int quantity = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Product Details'),
        actions: [
          IconButton(
            icon: Icon(Icons.favorite_border),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(Icons.share),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 300,
              color: Colors.grey[300],
              child: Center(
                child: Icon(Icons.image, size: 100, color: Colors.grey[400]),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.product.name,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber),
                      SizedBox(width: 4),
                      Text(
                        widget.product.rating.toString(),
                        style: TextStyle(fontSize: 18),
                      ),
                      SizedBox(width: 8),
                      Text(
                        '(\${widget.product.reviews} reviews)',
                        style: TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                    ],
                  ),
                  SizedBox(height: 16),
                  Text(
                    '\$\${widget.product.price.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  SizedBox(height: 16),
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: widget.product.inStock ? Colors.green[50] : Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          widget.product.inStock ? Icons.check_circle : Icons.cancel,
                          color: widget.product.inStock ? Colors.green : Colors.red,
                        ),
                        SizedBox(width: 8),
                        Text(
                          widget.product.inStock ? 'In Stock' : 'Out of Stock',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: widget.product.inStock ? Colors.green : Colors.red,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 24),
                  Text(
                    'Description',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    widget.product.description,
                    style: TextStyle(fontSize: 16, height: 1.5),
                  ),
                  SizedBox(height: 24),
                  Text(
                    'Category',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.blue[100],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      widget.product.category,
                      style: TextStyle(color: Colors.blue[900]),
                    ),
                  ),
                  SizedBox(height: 24),
                  Text(
                    'Quantity',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.remove_circle_outline),
                        onPressed: () {
                          if (quantity > 1) {
                            setState(() => quantity--);
                          }
                        },
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          quantity.toString(),
                          style: TextStyle(fontSize: 18),
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.add_circle_outline),
                        onPressed: () {
                          setState(() => quantity++);
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 4,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: widget.product.inStock ? () {} : null,
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.blue,
                ),
                child: Text(
                  'Add to Cart',
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: widget.product.inStock ? () {} : null,
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.green,
                ),
                child: Text(
                  'Buy Now',
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CartPage extends StatefulWidget {
  @override
  _CartPageState createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  List<CartItem> cartItems = [];

  @override
  void initState() {
    super.initState();
    loadCartItems();
  }

  void loadCartItems() {
    // Simulated cart items
    setState(() {
      cartItems = [
        CartItem(
          product: Product(
            id: '1',
            name: 'Wireless Headphones',
            description: 'High-quality wireless headphones',
            price: 199.99,
            category: 'Electronics',
            imageUrl: '',
            rating: 4.5,
            reviews: 234,
            inStock: true,
          ),
          quantity: 1,
        ),
        CartItem(
          product: Product(
            id: '2',
            name: 'Smart Watch',
            description: 'Fitness tracking smartwatch',
            price: 299.99,
            category: 'Electronics',
            imageUrl: '',
            rating: 4.7,
            reviews: 456,
            inStock: true,
          ),
          quantity: 2,
        ),
      ];
    });
  }

  double calculateTotal() {
    return cartItems.fold(0, (sum, item) => sum + (item.product.price * item.quantity));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Shopping Cart'),
      ),
      body: cartItems.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 100, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'Your cart is empty',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: cartItems.length,
                    itemBuilder: (context, index) {
                      return CartItemWidget(cartItem: cartItems[index]);
                    },
                  ),
                ),
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 4,
                        offset: Offset(0, -2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total:',
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '\$\${calculateTotal().toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: Colors.green,
                          ),
                          child: Text(
                            'Proceed to Checkout',
                            style: TextStyle(fontSize: 18, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class CartItemWidget extends StatelessWidget {
  final CartItem cartItem;

  const CartItemWidget({required this.cartItem});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.image, color: Colors.grey[400]),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    cartItem.product.name,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '\$\${cartItem.product.price.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.blue,
                    ),
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Text('Qty: \${cartItem.quantity}'),
                      SizedBox(width: 16),
                      Text(
                        'Subtotal: \$\${(cartItem.product.price * cartItem.quantity).toStringAsFixed(2)}',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            IconButton(
              icon: Icon(Icons.delete, color: Colors.red),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }
}

class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String category;
  final String imageUrl;
  final double rating;
  final int reviews;
  final bool inStock;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.imageUrl,
    required this.rating,
    required this.reviews,
    required this.inStock,
  });
}

class CartItem {
  final Product product;
  final int quantity;

  CartItem({
    required this.product,
    required this.quantity,
  });
}`,
  complexity: 'complex',
  widgets: [
    'MaterialApp', 'Scaffold', 'AppBar', 'TextField', 'ListView', 'GridView',
    'Card', 'Container', 'Padding', 'Column', 'Row', 'Text', 'Icon',
    'IconButton', 'ElevatedButton', 'CircularProgressIndicator', 'Center',
    'Expanded', 'SizedBox', 'GestureDetector', 'InkWell', 'SingleChildScrollView',
    'Stack', 'Positioned'
  ],
  category: 'app',
};

export const LARGE_SOCIAL_MEDIA_APP: CodeSampleSource = {
  id: 'large-social-media-feed',
  name: 'Social Media Feed Application',
  dartCode: `import 'package:flutter/material.dart';
import 'dart:async';

class SocialMediaApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Social Feed',
      theme: ThemeData(
        primarySwatch: Colors.purple,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        useMaterial3: true,
      ),
      home: FeedPage(),
    );
  }
}

class FeedPage extends StatefulWidget {
  @override
  _FeedPageState createState() => _FeedPageState();
}

class _FeedPageState extends State<FeedPage> with SingleTickerProviderStateMixin {
  List<Post> posts = [];
  bool isLoading = false;
  bool hasMore = true;
  ScrollController scrollController = ScrollController();
  TabController? tabController;
  int currentTab = 0;

  @override
  void initState() {
    super.initState();
    tabController = TabController(length: 3, vsync: this);
    loadInitialPosts();
    scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    scrollController.dispose();
    tabController?.dispose();
    super.dispose();
  }

  void _scrollListener() {
    if (scrollController.position.pixels ==
        scrollController.position.maxScrollExtent) {
      loadMorePosts();
    }
  }

  Future<void> loadInitialPosts() async {
    setState(() => isLoading = true);
    await Future.delayed(Duration(seconds: 1));
    setState(() {
      posts = _generateDemoPosts();
      isLoading = false;
    });
  }

  Future<void> loadMorePosts() async {
    if (isLoading || !hasMore) return;
    
    setState(() => isLoading = true);
    await Future.delayed(Duration(seconds: 1));
    
    setState(() {
      posts.addAll(_generateDemoPosts(startId: posts.length));
      isLoading = false;
      if (posts.length >= 30) hasMore = false;
    });
  }

  List<Post> _generateDemoPosts({int startId = 0}) {
    return List.generate(10, (index) {
      final id = startId + index;
      return Post(
        id: 'post_$id',
        authorName: 'User \$\{id % 5 + 1}',
        authorAvatar: 'https://example.com/avatar\$\{id % 5 + 1}.jpg',
        content: 'This is post number $id. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        imageUrl: id % 3 == 0 ? 'https://example.com/image$id.jpg' : null,
        likes: (id * 13) % 500,
        comments: (id * 7) % 100,
        shares: (id * 3) % 50,
        timestamp: DateTime.now().subtract(Duration(hours: id)),
        isLiked: false,
      );
    });
  }

  Future<void> refreshFeed() async {
    setState(() {
      posts.clear();
      hasMore = true;
    });
    await loadInitialPosts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Social Feed'),
        bottom: TabBar(
          controller: tabController,
          tabs: [
            Tab(icon: Icon(Icons.home), text: 'Feed'),
            Tab(icon: Icon(Icons.explore), text: 'Explore'),
            Tab(icon: Icon(Icons.notifications), text: 'Notifications'),
          ],
          onTap: (index) {
            setState(() => currentTab = index);
          },
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.search),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(Icons.chat_bubble_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: TabBarView(
        controller: tabController,
        children: [
          _buildFeedTab(),
          _buildExploreTab(),
          _buildNotificationsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            builder: (context) => CreatePostSheet(),
          );
        },
        child: Icon(Icons.add),
      ),
    );
  }

  Widget _buildFeedTab() {
    if (isLoading && posts.isEmpty) {
      return Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: refreshFeed,
      child: ListView.builder(
        controller: scrollController,
        itemCount: posts.length + (hasMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == posts.length) {
            return Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(),
              ),
            );
          }
          return PostCard(
            post: posts[index],
            onLike: () => _handleLike(index),
            onComment: () => _handleComment(index),
            onShare: () => _handleShare(index),
          );
        },
      ),
    );
  }

  Widget _buildExploreTab() {
    return GridView.builder(
      padding: EdgeInsets.all(4),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 4,
        mainAxisSpacing: 4,
      ),
      itemCount: 30,
      itemBuilder: (context, index) {
        return Container(
          color: Colors.grey[300],
          child: Center(
            child: Icon(Icons.image, size: 40, color: Colors.grey[400]),
          ),
        );
      },
    );
  }

  Widget _buildNotificationsTab() {
    return ListView.builder(
      itemCount: 15,
      itemBuilder: (context, index) {
        return NotificationTile(
          type: index % 3 == 0 ? 'like' : index % 3 == 1 ? 'comment' : 'follow',
          username: 'User \$\{index + 1}',
          time: '\$\{index + 1}h ago',
        );
      },
    );
  }

  void _handleLike(int index) {
    setState(() {
      posts[index].isLiked = !posts[index].isLiked;
      posts[index].likes += posts[index].isLiked ? 1 : -1;
    });
  }

  void _handleComment(int index) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => CommentSheet(post: posts[index]),
    );
  }

  void _handleShare(int index) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Post shared!')),
    );
  }
}

class PostCard extends StatelessWidget {
  final Post post;
  final VoidCallback onLike;
  final VoidCallback onComment;
  final VoidCallback onShare;

  const PostCard({
    required this.post,
    required this.onLike,
    required this.onComment,
    required this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.purple[200],
              child: Text(post.authorName[0]),
            ),
            title: Text(
              post.authorName,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(_formatTimestamp(post.timestamp)),
            trailing: IconButton(
              icon: Icon(Icons.more_vert),
              onPressed: () {},
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              post.content,
              style: TextStyle(fontSize: 14),
            ),
          ),
          if (post.imageUrl != null)
            Container(
              height: 250,
              width: double.infinity,
              color: Colors.grey[300],
              child: Center(
                child: Icon(Icons.image, size: 60, color: Colors.grey[400]),
              ),
            ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('\$\{post.likes} likes'),
                Text('\$\{post.comments} comments'),
                Text('\$\{post.shares} shares'),
              ],
            ),
          ),
          Divider(height: 1),
          Padding(
            padding: EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                TextButton.icon(
                  onPressed: onLike,
                  icon: Icon(
                    post.isLiked ? Icons.favorite : Icons.favorite_border,
                    color: post.isLiked ? Colors.red : Colors.grey,
                  ),
                  label: Text('Like'),
                ),
                TextButton.icon(
                  onPressed: onComment,
                  icon: Icon(Icons.comment_outlined),
                  label: Text('Comment'),
                ),
                TextButton.icon(
                  onPressed: onShare,
                  icon: Icon(Icons.share),
                  label: Text('Share'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    
    if (difference.inDays > 7) {
      return '\$\{timestamp.day}/\$\{timestamp.month}/\$\{timestamp.year}';
    } else if (difference.inDays > 0) {
      return '\$\{difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '\$\{difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '\$\{difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

class NotificationTile extends StatelessWidget {
  final String type;
  final String username;
  final String time;

  const NotificationTile({
    required this.type,
    required this.username,
    required this.time,
  });

  @override
  Widget build(BuildContext context) {
    IconData icon;
    String message;
    Color iconColor;

    switch (type) {
      case 'like':
        icon = Icons.favorite;
        message = 'liked your post';
        iconColor = Colors.red;
        break;
      case 'comment':
        icon = Icons.comment;
        message = 'commented on your post';
        iconColor = Colors.blue;
        break;
      case 'follow':
        icon = Icons.person_add;
        message = 'started following you';
        iconColor = Colors.green;
        break;
      default:
        icon = Icons.notifications;
        message = 'sent you a notification';
        iconColor = Colors.grey;
    }

    return ListTile(
      leading: Stack(
        children: [
          CircleAvatar(
            backgroundColor: Colors.purple[200],
            child: Text(username[0]),
          ),
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              padding: EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 12, color: iconColor),
            ),
          ),
        ],
      ),
      title: RichText(
        text: TextSpan(
          style: TextStyle(color: Colors.black),
          children: [
            TextSpan(
              text: username,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            TextSpan(text: ' $message'),
          ],
        ),
      ),
      subtitle: Text(time),
      trailing: type == 'follow'
          ? ElevatedButton(
              onPressed: () {},
              child: Text('Follow Back'),
            )
          : null,
    );
  }
}

class CreatePostSheet extends StatefulWidget {
  @override
  _CreatePostSheetState createState() => _CreatePostSheetState();
}

class _CreatePostSheetState extends State<CreatePostSheet> {
  TextEditingController textController = TextEditingController();
  bool hasImage = false;

  @override
  void dispose() {
    textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AppBar(
            title: Text('Create Post'),
            leading: IconButton(
              icon: Icon(Icons.close),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  // Handle post
                  Navigator.pop(context);
                },
                child: Text('Post', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: textController,
                  decoration: InputDecoration(
                    hintText: "What's on your mind?",
                    border: InputBorder.none,
                  ),
                  maxLines: 5,
                ),
                if (hasImage)
                  Container(
                    height: 200,
                    margin: EdgeInsets.symmetric(vertical: 16),
                    color: Colors.grey[300],
                    child: Stack(
                      children: [
                        Center(
                          child: Icon(Icons.image, size: 60, color: Colors.grey[400]),
                        ),
                        Positioned(
                          top: 8,
                          right: 8,
                          child: IconButton(
                            icon: Icon(Icons.close, color: Colors.red),
                            onPressed: () {
                              setState(() => hasImage = false);
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.photo, color: Colors.green),
                      onPressed: () {
                        setState(() => hasImage = true);
                      },
                    ),
                    IconButton(
                      icon: Icon(Icons.videocam, color: Colors.red),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: Icon(Icons.location_on, color: Colors.blue),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: Icon(Icons.emoji_emotions, color: Colors.amber),
                      onPressed: () {},
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class CommentSheet extends StatefulWidget {
  final Post post;

  const CommentSheet({required this.post});

  @override
  _CommentSheetState createState() => _CommentSheetState();
}

class _CommentSheetState extends State<CommentSheet> {
  TextEditingController commentController = TextEditingController();
  List<Comment> comments = [];

  @override
  void initState() {
    super.initState();
    loadComments();
  }

  @override
  void dispose() {
    commentController.dispose();
    super.dispose();
  }

  void loadComments() {
    setState(() {
      comments = List.generate(
        widget.post.comments,
        (index) => Comment(
          id: 'comment_$index',
          authorName: 'Commenter \$\{index + 1}',
          content: 'This is comment number \$\{index + 1}',
          timestamp: DateTime.now().subtract(Duration(hours: index)),
          likes: index * 3,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      child: Column(
        children: [
          AppBar(
            title: Text('Comments'),
            leading: IconButton(
              icon: Icon(Icons.close),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: comments.length,
              itemBuilder: (context, index) {
                return CommentTile(comment: comments[index]);
              },
            ),
          ),
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 4,
                  offset: Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.purple[200],
                  radius: 18,
                  child: Text('U'),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: commentController,
                    decoration: InputDecoration(
                      hintText: 'Write a comment...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                  ),
                ),
                SizedBox(width: 8),
                IconButton(
                  icon: Icon(Icons.send, color: Colors.purple),
                  onPressed: () {
                    if (commentController.text.isNotEmpty) {
                      commentController.clear();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Comment posted!')),
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class CommentTile extends StatelessWidget {
  final Comment comment;

  const CommentTile({required this.comment});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: Colors.purple[200],
            radius: 18,
            child: Text(comment.authorName[0]),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        comment.authorName,
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(comment.content),
                    ],
                  ),
                ),
                SizedBox(height: 4),
                Row(
                  children: [
                    TextButton(
                      onPressed: () {},
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size(0, 0),
                      ),
                      child: Text('Like', style: TextStyle(fontSize: 12)),
                    ),
                    SizedBox(width: 16),
                    TextButton(
                      onPressed: () {},
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size(0, 0),
                      ),
                      child: Text('Reply', style: TextStyle(fontSize: 12)),
                    ),
                    SizedBox(width: 16),
                    Text(
                      '\$\{comment.likes} likes',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class Post {
  final String id;
  final String authorName;
  final String authorAvatar;
  final String content;
  final String? imageUrl;
  int likes;
  final int comments;
  final int shares;
  final DateTime timestamp;
  bool isLiked;

  Post({
    required this.id,
    required this.authorName,
    required this.authorAvatar,
    required this.content,
    this.imageUrl,
    required this.likes,
    required this.comments,
    required this.shares,
    required this.timestamp,
    required this.isLiked,
  });
}

class Comment {
  final String id;
  final String authorName;
  final String content;
  final DateTime timestamp;
  final int likes;

  Comment({
    required this.id,
    required this.authorName,
    required this.content,
    required this.timestamp,
    required this.likes,
  });
}`,
  complexity: 'complex',
  widgets: [
    'MaterialApp', 'Scaffold', 'AppBar', 'TabBar', 'TabBarView', 'ListView',
    'GridView', 'Card', 'ListTile', 'Container', 'Column', 'Row', 'Text',
    'Icon', 'IconButton', 'TextButton', 'ElevatedButton', 'FloatingActionButton',
    'CircularProgressIndicator', 'TextField', 'RefreshIndicator', 'Padding',
    'SizedBox', 'Divider', 'Stack', 'Positioned', 'CircleAvatar', 'Center',
    'Expanded', 'RichText', 'ModalBottomSheet'
  ],
  category: 'app',
};

// Export all large samples
export const LARGE_CODE_SAMPLES: CodeSampleSource[] = [
  LARGE_FLUTTER_APP_1,
  LARGE_SOCIAL_MEDIA_APP,
];

