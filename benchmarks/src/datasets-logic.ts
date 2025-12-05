/**
 * Business Logic Code Samples for COON Benchmarks
 * 
 * Contains non-UI Dart code samples: repositories, services, state management, models
 * COON versions are generated dynamically using the actual COON SDK.
 */

import type { CodeSample, CodeSampleSource } from './types.js';
import { compressToCoon } from './coon-generator.js';

// ============================================================
// Helper Functions
// ============================================================

function minify(dart: string): string {
  return dart
    .replace(/\/\/.*$/gm, '')           // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove multi-line comments
    .replace(/\s+/g, ' ')               // Collapse whitespace
    .replace(/\s*([{}(),;:])\s*/g, '$1') // Remove space around punctuation
    .trim();
}

/**
 * Convert a source-only sample to a full CodeSample by generating COON
 */
function toCodeSample(source: CodeSampleSource): CodeSample {
  return {
    ...source,
    coonCode: compressToCoon(source.dartCode),
    minifiedCode: minify(source.dartCode),
  };
}

// ============================================================
// Repository Pattern Samples (Source Only)
// ============================================================

const repositorySampleSources: CodeSampleSource[] = [
  {
    id: 'simple-repository',
    name: 'Simple User Repository',
    dartCode: `abstract class UserRepository {
  Future<User> getUser(String id);
  Future<List<User>> getAllUsers();
  Future<void> saveUser(User user);
  Future<void> deleteUser(String id);
}`,
    complexity: 'simple',
    widgets: [],
    category: 'repository',
    description: 'Abstract repository interface for User CRUD operations',
  },
  {
    id: 'repository-impl',
    name: 'Repository Implementation',
    dartCode: `class UserRepositoryImpl implements UserRepository {
  final ApiClient _client;
  final UserCache _cache;
  
  UserRepositoryImpl(this._client, this._cache);
  
  @override
  Future<User> getUser(String id) async {
    final cached = await _cache.get(id);
    if (cached != null) return cached;
    
    final user = await _client.fetchUser(id);
    await _cache.set(id, user);
    return user;
  }
  
  @override
  Future<List<User>> getAllUsers() async {
    return await _client.fetchAllUsers();
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'repository',
    description: 'Repository implementation with caching strategy',
  },
  {
    id: 'repository-error-handling',
    name: 'Repository with Error Handling',
    dartCode: `class ProductRepository {
  final ProductApi _api;
  
  Future<Result<Product>> getProduct(String id) async {
    try {
      final response = await _api.fetch(id);
      if (response.isSuccess) {
        return Result.success(response.data);
      }
      return Result.failure(response.error);
    } on NetworkException catch (e) {
      return Result.failure(AppError.network(e.message));
    } on TimeoutException {
      return Result.failure(AppError.timeout());
    }
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'repository',
    description: 'Repository with comprehensive error handling',
  },
];

// ============================================================
// State Management Samples (BLoC/Cubit Pattern)
// ============================================================

const stateManagementSampleSources: CodeSampleSource[] = [
  {
    id: 'simple-cubit',
    name: 'Simple Counter Cubit',
    dartCode: `class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);
  
  void increment() => emit(state + 1);
  void decrement() => emit(state - 1);
  void reset() => emit(0);
}`,
    complexity: 'simple',
    widgets: [],
    category: 'state-management',
    description: 'Simple Cubit for counter state',
  },
  {
    id: 'auth-bloc',
    name: 'Authentication BLoC',
    dartCode: `class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepo;
  
  AuthBloc(this._authRepo) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<CheckAuthStatus>(_onCheckAuthStatus);
  }
  
  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final user = await _authRepo.login(event.email, event.password);
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }
  
  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    await _authRepo.logout();
    emit(AuthUnauthenticated());
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'state-management',
    description: 'Full authentication BLoC with events and states',
  },
  {
    id: 'product-cubit',
    name: 'Product List Cubit',
    dartCode: `class ProductCubit extends Cubit<ProductState> {
  final ProductRepository _repository;
  
  ProductCubit(this._repository) : super(ProductInitial());
  
  Future<void> loadProducts() async {
    emit(ProductLoading());
    final result = await _repository.getProducts();
    result.fold(
      (error) => emit(ProductError(error.message)),
      (products) => emit(ProductLoaded(products)),
    );
  }
  
  void filterByCategory(String category) {
    if (state is ProductLoaded) {
      final current = state as ProductLoaded;
      final filtered = current.products.where((p) => p.category == category).toList();
      emit(ProductLoaded(filtered, filter: category));
    }
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'state-management',
    description: 'Cubit with loading, error states, and filtering logic',
  },
];

// ============================================================
// Service Layer Samples
// ============================================================

const serviceSampleSources: CodeSampleSource[] = [
  {
    id: 'api-service',
    name: 'API Service',
    dartCode: `class ApiService {
  final Dio _dio;
  final String _baseUrl;
  
  ApiService(this._dio, this._baseUrl);
  
  Future<Response> get(String endpoint, {Map<String, dynamic>? params}) async {
    return await _dio.get('\$_baseUrl\$endpoint', queryParameters: params);
  }
  
  Future<Response> post(String endpoint, {dynamic data}) async {
    return await _dio.post('\$_baseUrl\$endpoint', data: data);
  }
  
  Future<Response> put(String endpoint, {dynamic data}) async {
    return await _dio.put('\$_baseUrl\$endpoint', data: data);
  }
  
  Future<Response> delete(String endpoint) async {
    return await _dio.delete('\$_baseUrl\$endpoint');
  }
}`,
    complexity: 'medium',
    widgets: [],
    category: 'service',
    description: 'HTTP API service with CRUD operations',
  },
  {
    id: 'auth-service',
    name: 'Authentication Service',
    dartCode: `class AuthService {
  final SecureStorage _storage;
  final ApiService _api;
  
  Future<User?> login(String email, String password) async {
    final response = await _api.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    
    if (response.statusCode == 200) {
      final token = response.data['token'];
      await _storage.write(key: 'auth_token', value: token);
      return User.fromJson(response.data['user']);
    }
    return null;
  }
  
  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
  }
  
  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: 'auth_token');
    return token != null;
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'service',
    description: 'Authentication service with token management',
  },
  {
    id: 'validation-service',
    name: 'Form Validation Service',
    dartCode: `class ValidationService {
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    final regex = RegExp(r'^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}\$');
    if (!regex.hasMatch(value)) {
      return 'Invalid email format';
    }
    return null;
  }
  
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return null;
  }
  
  static String? validateConfirmPassword(String? value, String password) {
    final error = validatePassword(value);
    if (error != null) return error;
    if (value != password) {
      return 'Passwords do not match';
    }
    return null;
  }
}`,
    complexity: 'medium',
    widgets: [],
    category: 'service',
    description: 'Form validation service with common validators',
  },
];

// ============================================================
// Data Model Samples
// ============================================================

const modelSampleSources: CodeSampleSource[] = [
  {
    id: 'user-model',
    name: 'User Model',
    dartCode: `class User {
  final String id;
  final String email;
  final String name;
  final DateTime createdAt;
  final bool isActive;
  
  User({
    required this.id,
    required this.email,
    required this.name,
    required this.createdAt,
    this.isActive = true,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      createdAt: DateTime.parse(json['created_at']),
      isActive: json['is_active'] ?? true,
    );
  }
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'created_at': createdAt.toIso8601String(),
    'is_active': isActive,
  };
}`,
    complexity: 'medium',
    widgets: [],
    category: 'model',
    description: 'User model with JSON serialization',
  },
  {
    id: 'product-model',
    name: 'Product Model with Calculations',
    dartCode: `class Product {
  final String id;
  final String name;
  final double price;
  final double discount;
  final int stock;
  final String category;
  
  Product({
    required this.id,
    required this.name,
    required this.price,
    this.discount = 0,
    required this.stock,
    required this.category,
  });
  
  double get finalPrice => price * (1 - discount / 100);
  
  bool get isInStock => stock > 0;
  
  bool get isOnSale => discount > 0;
  
  double calculateTotal(int quantity) {
    if (quantity > stock) {
      throw Exception('Insufficient stock');
    }
    return finalPrice * quantity;
  }
  
  Product copyWith({String? name, double? price, double? discount, int? stock}) {
    return Product(
      id: id,
      name: name ?? this.name,
      price: price ?? this.price,
      discount: discount ?? this.discount,
      stock: stock ?? this.stock,
      category: category,
    );
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'model',
    description: 'Product model with computed properties and business logic',
  },
  {
    id: 'order-model',
    name: 'Order Model with State',
    dartCode: `enum OrderStatus { pending, processing, shipped, delivered, cancelled }

class Order {
  final String id;
  final List<OrderItem> items;
  final DateTime createdAt;
  OrderStatus status;
  
  Order({
    required this.id,
    required this.items,
    required this.createdAt,
    this.status = OrderStatus.pending,
  });
  
  double get subtotal => items.fold(0, (sum, item) => sum + item.total);
  
  double get tax => subtotal * 0.1;
  
  double get total => subtotal + tax;
  
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
  
  bool get canCancel => status == OrderStatus.pending || status == OrderStatus.processing;
  
  void cancel() {
    if (!canCancel) {
      throw Exception('Cannot cancel order in \$status state');
    }
    status = OrderStatus.cancelled;
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'model',
    description: 'Order model with state management and business rules',
  },
];

// ============================================================
// Utility/Helper Samples
// ============================================================

const utilitySampleSources: CodeSampleSource[] = [
  {
    id: 'result-class',
    name: 'Result Type (Either Pattern)',
    dartCode: `sealed class Result<T> {
  const Result();
  
  factory Result.success(T data) = Success<T>;
  factory Result.failure(AppError error) = Failure<T>;
  
  R fold<R>(R Function(AppError) onFailure, R Function(T) onSuccess);
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
  
  @override
  R fold<R>(R Function(AppError) onFailure, R Function(T) onSuccess) {
    return onSuccess(data);
  }
}

class Failure<T> extends Result<T> {
  final AppError error;
  const Failure(this.error);
  
  @override
  R fold<R>(R Function(AppError) onFailure, R Function(T) onSuccess) {
    return onFailure(error);
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'utility',
    description: 'Result type for functional error handling',
  },
  {
    id: 'extension-methods',
    name: 'String Extensions',
    dartCode: `extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '\${this[0].toUpperCase()}\${substring(1)}';
  }
  
  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '\${substring(0, maxLength - ellipsis.length)}\$ellipsis';
  }
  
  bool get isValidEmail {
    return RegExp(r'^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}\$').hasMatch(this);
  }
  
  String? get nullIfEmpty => isEmpty ? null : this;
}`,
    complexity: 'medium',
    widgets: [],
    category: 'utility',
    description: 'Extension methods on String',
  },
  {
    id: 'debouncer',
    name: 'Debouncer Utility',
    dartCode: `class Debouncer {
  final Duration delay;
  Timer? _timer;
  
  Debouncer({required this.delay});
  
  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }
  
  void cancel() {
    _timer?.cancel();
    _timer = null;
  }
  
  bool get isRunning => _timer?.isActive ?? false;
  
  void dispose() {
    cancel();
  }
}`,
    complexity: 'simple',
    widgets: [],
    category: 'utility',
    description: 'Debouncer utility for rate limiting',
  },
];

// ============================================================
// ADVANCED/HARD EDGE CASE SAMPLES
// These test complex scenarios that challenge LLM comprehension
// ============================================================

const advancedEdgeCaseSources: CodeSampleSource[] = [
  {
    id: 'recursive-tree-builder',
    name: 'Recursive Tree Data Structure',
    dartCode: `class TreeNode<T> {
  final T value;
  final List<TreeNode<T>> children;
  TreeNode<T>? parent;
  
  TreeNode(this.value, {this.children = const [], this.parent});
  
  TreeNode<T> addChild(T value) {
    final child = TreeNode<T>(value, parent: this);
    children.add(child);
    return child;
  }
  
  int get depth => parent == null ? 0 : parent!.depth + 1;
  
  bool get isLeaf => children.isEmpty;
  
  bool get isRoot => parent == null;
  
  TreeNode<T>? findFirst(bool Function(T) predicate) {
    if (predicate(value)) return this;
    for (final child in children) {
      final found = child.findFirst(predicate);
      if (found != null) return found;
    }
    return null;
  }
  
  List<T> flatten() {
    return [value, ...children.expand((c) => c.flatten())];
  }
  
  TreeNode<R> map<R>(R Function(T) transform) {
    return TreeNode<R>(
      transform(value),
      children: children.map((c) => c.map(transform)).toList(),
    );
  }
  
  int get totalNodes => 1 + children.fold(0, (sum, c) => sum + c.totalNodes);
}`,
    complexity: 'complex',
    widgets: [],
    category: 'advanced-logic',
    description: 'Generic recursive tree with traversal and transformation',
  },
  {
    id: 'async-retry-mechanism',
    name: 'Advanced Retry with Exponential Backoff',
    dartCode: `class RetryPolicy {
  final int maxAttempts;
  final Duration initialDelay;
  final double backoffMultiplier;
  final Duration maxDelay;
  final bool Function(Exception)? shouldRetry;
  
  const RetryPolicy({
    this.maxAttempts = 3,
    this.initialDelay = const Duration(seconds: 1),
    this.backoffMultiplier = 2.0,
    this.maxDelay = const Duration(seconds: 30),
    this.shouldRetry,
  });
  
  Future<T> execute<T>(Future<T> Function() action) async {
    int attempt = 0;
    Duration delay = initialDelay;
    
    while (true) {
      attempt++;
      try {
        return await action();
      } on Exception catch (e) {
        final isRetryable = shouldRetry?.call(e) ?? true;
        final hasMoreAttempts = attempt < maxAttempts;
        
        if (!isRetryable || !hasMoreAttempts) {
          rethrow;
        }
        
        await Future.delayed(delay);
        delay = Duration(
          milliseconds: (delay.inMilliseconds * backoffMultiplier)
            .clamp(0, maxDelay.inMilliseconds)
            .toInt(),
        );
      }
    }
  }
  
  RetryPolicy copyWith({
    int? maxAttempts,
    Duration? initialDelay,
    double? backoffMultiplier,
  }) {
    return RetryPolicy(
      maxAttempts: maxAttempts ?? this.maxAttempts,
      initialDelay: initialDelay ?? this.initialDelay,
      backoffMultiplier: backoffMultiplier ?? this.backoffMultiplier,
    );
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'advanced-logic',
    description: 'Retry mechanism with exponential backoff and configurable policy',
  },
  {
    id: 'event-sourcing-aggregate',
    name: 'Event Sourcing Aggregate Root',
    dartCode: `abstract class DomainEvent {
  final String aggregateId;
  final DateTime occurredAt;
  final int version;
  
  DomainEvent(this.aggregateId, this.version) : occurredAt = DateTime.now();
}

abstract class AggregateRoot<TState, TEvent extends DomainEvent> {
  final String id;
  final List<TEvent> _uncommittedEvents = [];
  int _version = 0;
  late TState _state;
  
  AggregateRoot(this.id) {
    _state = initialState();
  }
  
  TState get state => _state;
  int get version => _version;
  List<TEvent> get uncommittedEvents => List.unmodifiable(_uncommittedEvents);
  
  TState initialState();
  TState applyEvent(TState state, TEvent event);
  
  void apply(TEvent event) {
    _state = applyEvent(_state, event);
    _uncommittedEvents.add(event);
    _version++;
  }
  
  void loadFromHistory(List<TEvent> events) {
    for (final event in events) {
      _state = applyEvent(_state, event);
      _version = event.version;
    }
  }
  
  void markEventsAsCommitted() {
    _uncommittedEvents.clear();
  }
}

class AccountCreated extends DomainEvent {
  final String ownerName;
  final double initialBalance;
  AccountCreated(String id, int version, this.ownerName, this.initialBalance)
      : super(id, version);
}

class MoneyDeposited extends DomainEvent {
  final double amount;
  MoneyDeposited(String id, int version, this.amount) : super(id, version);
}

class MoneyWithdrawn extends DomainEvent {
  final double amount;
  MoneyWithdrawn(String id, int version, this.amount) : super(id, version);
}

class AccountState {
  final String? ownerName;
  final double balance;
  final bool isClosed;
  
  const AccountState({this.ownerName, this.balance = 0, this.isClosed = false});
  
  AccountState copyWith({String? ownerName, double? balance, bool? isClosed}) {
    return AccountState(
      ownerName: ownerName ?? this.ownerName,
      balance: balance ?? this.balance,
      isClosed: isClosed ?? this.isClosed,
    );
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'advanced-logic',
    description: 'Event sourcing pattern with aggregate root and domain events',
  },
  {
    id: 'dependency-injection-container',
    name: 'Simple DI Container',
    dartCode: `typedef FactoryFunc<T> = T Function(DIContainer container);

class DIContainer {
  final Map<Type, dynamic> _singletons = {};
  final Map<Type, FactoryFunc> _factories = {};
  final DIContainer? _parent;
  
  DIContainer({DIContainer? parent}) : _parent = parent;
  
  void registerSingleton<T>(T instance) {
    _singletons[T] = instance;
  }
  
  void registerFactory<T>(FactoryFunc<T> factory) {
    _factories[T] = factory;
  }
  
  void registerLazySingleton<T>(FactoryFunc<T> factory) {
    _factories[T] = (container) {
      if (!_singletons.containsKey(T)) {
        _singletons[T] = factory(container);
      }
      return _singletons[T] as T;
    };
  }
  
  T resolve<T>() {
    if (_singletons.containsKey(T)) {
      return _singletons[T] as T;
    }
    
    if (_factories.containsKey(T)) {
      return _factories[T]!(this) as T;
    }
    
    if (_parent != null) {
      return _parent!.resolve<T>();
    }
    
    throw Exception('No registration for type \$T');
  }
  
  bool canResolve<T>() {
    return _singletons.containsKey(T) || 
           _factories.containsKey(T) ||
           (_parent?.canResolve<T>() ?? false);
  }
  
  DIContainer createScope() => DIContainer(parent: this);
  
  void dispose() {
    for (final singleton in _singletons.values) {
      if (singleton is Disposable) {
        singleton.dispose();
      }
    }
    _singletons.clear();
    _factories.clear();
  }
}

abstract class Disposable {
  void dispose();
}`,
    complexity: 'complex',
    widgets: [],
    category: 'advanced-logic',
    description: 'Dependency injection container with scoping and lifecycle management',
  },
  {
    id: 'state-machine',
    name: 'Generic Finite State Machine',
    dartCode: `typedef TransitionGuard<S, E> = bool Function(S currentState, E event);
typedef TransitionAction<S, E> = void Function(S from, E event, S to);

class Transition<S, E> {
  final S from;
  final E event;
  final S to;
  final TransitionGuard<S, E>? guard;
  final TransitionAction<S, E>? action;
  
  const Transition({
    required this.from,
    required this.event,
    required this.to,
    this.guard,
    this.action,
  });
}

class StateMachine<S, E> {
  S _currentState;
  final List<Transition<S, E>> _transitions;
  final List<void Function(S, S)> _listeners = [];
  final Map<S, void Function()> _onEnterCallbacks = {};
  final Map<S, void Function()> _onExitCallbacks = {};
  
  StateMachine({
    required S initialState,
    required List<Transition<S, E>> transitions,
  })  : _currentState = initialState,
        _transitions = transitions;
  
  S get currentState => _currentState;
  
  void onEnter(S state, void Function() callback) {
    _onEnterCallbacks[state] = callback;
  }
  
  void onExit(S state, void Function() callback) {
    _onExitCallbacks[state] = callback;
  }
  
  void addListener(void Function(S oldState, S newState) listener) {
    _listeners.add(listener);
  }
  
  bool canFire(E event) {
    return _transitions.any((t) => 
      t.from == _currentState && 
      t.event == event && 
      (t.guard?.call(_currentState, event) ?? true)
    );
  }
  
  bool fire(E event) {
    final transition = _transitions.firstWhere(
      (t) => t.from == _currentState && 
             t.event == event &&
             (t.guard?.call(_currentState, event) ?? true),
      orElse: () => throw StateError('Invalid transition: \$_currentState + \$event'),
    );
    
    final oldState = _currentState;
    _onExitCallbacks[oldState]?.call();
    
    transition.action?.call(oldState, event, transition.to);
    _currentState = transition.to;
    
    _onEnterCallbacks[_currentState]?.call();
    
    for (final listener in _listeners) {
      listener(oldState, _currentState);
    }
    
    return true;
  }
  
  List<E> availableEvents() {
    return _transitions
        .where((t) => t.from == _currentState && 
                     (t.guard?.call(_currentState, t.event) ?? true))
        .map((t) => t.event)
        .toList();
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'advanced-logic',
    description: 'Generic finite state machine with guards, actions, and callbacks',
  },
  {
    id: 'reactive-stream-combinator',
    name: 'Stream Combinator Utilities',
    dartCode: `extension StreamCombinators<T> on Stream<T> {
  Stream<T> debounceTime(Duration duration) {
    Timer? timer;
    T? lastValue;
    bool hasValue = false;
    
    return transform(StreamTransformer.fromHandlers(
      handleData: (data, sink) {
        lastValue = data;
        hasValue = true;
        timer?.cancel();
        timer = Timer(duration, () {
          if (hasValue) {
            sink.add(lastValue as T);
            hasValue = false;
          }
        });
      },
      handleDone: (sink) {
        timer?.cancel();
        if (hasValue) sink.add(lastValue as T);
        sink.close();
      },
    ));
  }
  
  Stream<T> throttleTime(Duration duration) {
    DateTime? lastEmit;
    
    return where((_) {
      final now = DateTime.now();
      if (lastEmit == null || now.difference(lastEmit!) >= duration) {
        lastEmit = now;
        return true;
      }
      return false;
    });
  }
  
  Stream<List<T>> bufferCount(int count) async* {
    final buffer = <T>[];
    await for (final item in this) {
      buffer.add(item);
      if (buffer.length >= count) {
        yield List.from(buffer);
        buffer.clear();
      }
    }
    if (buffer.isNotEmpty) yield buffer;
  }
  
  Stream<T> distinctUntilChanged([bool Function(T, T)? equals]) {
    T? previous;
    bool hasPrevious = false;
    
    return where((current) {
      final isDifferent = !hasPrevious || 
          !(equals?.call(previous as T, current) ?? previous == current);
      previous = current;
      hasPrevious = true;
      return isDifferent;
    });
  }
  
  Stream<R> switchMap<R>(Stream<R> Function(T) mapper) async* {
    StreamSubscription<R>? innerSubscription;
    
    await for (final outer in this) {
      await innerSubscription?.cancel();
      yield* mapper(outer);
    }
  }
  
  Stream<T> takeUntil(Future<void> trigger) {
    return transform(StreamTransformer.fromHandlers(
      handleData: (data, sink) => sink.add(data),
      handleDone: (sink) => sink.close(),
    )).takeWhile((_) => !trigger.isCompleted);
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'advanced-logic',
    description: 'Reactive stream combinators with debounce, throttle, buffer',
  },
  {
    id: 'graph-algorithms',
    name: 'Graph with Pathfinding',
    dartCode: `class Graph<T> {
  final Map<T, Set<T>> _adjacencyList = {};
  final Map<(T, T), double> _weights = {};
  final bool isDirected;
  
  Graph({this.isDirected = false});
  
  void addVertex(T vertex) {
    _adjacencyList.putIfAbsent(vertex, () => {});
  }
  
  void addEdge(T from, T to, [double weight = 1.0]) {
    addVertex(from);
    addVertex(to);
    _adjacencyList[from]!.add(to);
    _weights[(from, to)] = weight;
    
    if (!isDirected) {
      _adjacencyList[to]!.add(from);
      _weights[(to, from)] = weight;
    }
  }
  
  Set<T> get vertices => _adjacencyList.keys.toSet();
  Set<T> neighbors(T vertex) => _adjacencyList[vertex] ?? {};
  double? weight(T from, T to) => _weights[(from, to)];
  
  List<T>? bfs(T start, T end) {
    final visited = <T>{};
    final queue = <List<T>>[[start]];
    
    while (queue.isNotEmpty) {
      final path = queue.removeAt(0);
      final vertex = path.last;
      
      if (vertex == end) return path;
      
      if (!visited.contains(vertex)) {
        visited.add(vertex);
        for (final neighbor in neighbors(vertex)) {
          queue.add([...path, neighbor]);
        }
      }
    }
    return null;
  }
  
  Map<T, double> dijkstra(T start) {
    final distances = <T, double>{};
    final visited = <T>{};
    final pq = PriorityQueue<(T, double)>((a, b) => a.\$2.compareTo(b.\$2));
    
    for (final v in vertices) {
      distances[v] = double.infinity;
    }
    distances[start] = 0;
    pq.add((start, 0));
    
    while (pq.isNotEmpty) {
      final (current, dist) = pq.removeFirst();
      if (visited.contains(current)) continue;
      visited.add(current);
      
      for (final neighbor in neighbors(current)) {
        final newDist = dist + (weight(current, neighbor) ?? 1);
        if (newDist < distances[neighbor]!) {
          distances[neighbor] = newDist;
          pq.add((neighbor, newDist));
        }
      }
    }
    return distances;
  }
  
  bool hasCycle() {
    final visited = <T>{};
    final recursionStack = <T>{};
    
    bool dfs(T vertex) {
      visited.add(vertex);
      recursionStack.add(vertex);
      
      for (final neighbor in neighbors(vertex)) {
        if (!visited.contains(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.contains(neighbor)) {
          return true;
        }
      }
      
      recursionStack.remove(vertex);
      return false;
    }
    
    for (final vertex in vertices) {
      if (!visited.contains(vertex) && dfs(vertex)) {
        return true;
      }
    }
    return false;
  }
  
  List<T>? topologicalSort() {
    if (!isDirected || hasCycle()) return null;
    
    final visited = <T>{};
    final result = <T>[];
    
    void dfs(T vertex) {
      visited.add(vertex);
      for (final neighbor in neighbors(vertex)) {
        if (!visited.contains(neighbor)) {
          dfs(neighbor);
        }
      }
      result.insert(0, vertex);
    }
    
    for (final vertex in vertices) {
      if (!visited.contains(vertex)) {
        dfs(vertex);
      }
    }
    return result;
  }
}`,
    complexity: 'complex',
    widgets: [],
    category: 'advanced-logic',
    description: 'Graph data structure with BFS, Dijkstra, cycle detection, topological sort',
  },
  {
    id: 'cache-with-policies',
    name: 'LRU Cache with TTL',
    dartCode: `class CacheEntry<T> {
  final T value;
  final DateTime createdAt;
  final Duration? ttl;
  DateTime lastAccessed;
  int accessCount;
  
  CacheEntry(this.value, {this.ttl})
      : createdAt = DateTime.now(),
        lastAccessed = DateTime.now(),
        accessCount = 0;
  
  bool get isExpired {
    if (ttl == null) return false;
    return DateTime.now().difference(createdAt) > ttl!;
  }
  
  void recordAccess() {
    lastAccessed = DateTime.now();
    accessCount++;
  }
}

enum EvictionPolicy { lru, lfu, fifo, ttl }

class Cache<K, V> {
  final int maxSize;
  final Duration? defaultTtl;
  final EvictionPolicy policy;
  final Map<K, CacheEntry<V>> _cache = {};
  final LinkedList<K>? _accessOrder;
  
  int _hits = 0;
  int _misses = 0;
  
  Cache({
    required this.maxSize,
    this.defaultTtl,
    this.policy = EvictionPolicy.lru,
  }) : _accessOrder = policy == EvictionPolicy.lru || policy == EvictionPolicy.fifo 
        ? LinkedList<K>() 
        : null;
  
  double get hitRate => _hits + _misses == 0 ? 0 : _hits / (_hits + _misses);
  int get size => _cache.length;
  bool get isEmpty => _cache.isEmpty;
  
  V? get(K key) {
    _evictExpired();
    
    final entry = _cache[key];
    if (entry == null) {
      _misses++;
      return null;
    }
    
    if (entry.isExpired) {
      remove(key);
      _misses++;
      return null;
    }
    
    _hits++;
    entry.recordAccess();
    
    if (policy == EvictionPolicy.lru) {
      _accessOrder!.remove(key);
      _accessOrder!.addLast(key);
    }
    
    return entry.value;
  }
  
  void put(K key, V value, {Duration? ttl}) {
    _evictExpired();
    
    if (_cache.length >= maxSize && !_cache.containsKey(key)) {
      _evictOne();
    }
    
    final entry = CacheEntry<V>(value, ttl: ttl ?? defaultTtl);
    _cache[key] = entry;
    
    if (_accessOrder != null) {
      _accessOrder!.remove(key);
      _accessOrder!.addLast(key);
    }
  }
  
  void remove(K key) {
    _cache.remove(key);
    _accessOrder?.remove(key);
  }
  
  void clear() {
    _cache.clear();
    _accessOrder?.clear();
    _hits = 0;
    _misses = 0;
  }
  
  void _evictExpired() {
    final expired = _cache.entries
        .where((e) => e.value.isExpired)
        .map((e) => e.key)
        .toList();
    for (final key in expired) {
      remove(key);
    }
  }
  
  void _evictOne() {
    if (_cache.isEmpty) return;
    
    K? keyToEvict;
    switch (policy) {
      case EvictionPolicy.lru:
      case EvictionPolicy.fifo:
        keyToEvict = _accessOrder!.first;
        break;
      case EvictionPolicy.lfu:
        keyToEvict = _cache.entries
            .reduce((a, b) => a.value.accessCount < b.value.accessCount ? a : b)
            .key;
        break;
      case EvictionPolicy.ttl:
        keyToEvict = _cache.entries
            .reduce((a, b) => a.value.createdAt.isBefore(b.value.createdAt) ? a : b)
            .key;
        break;
    }
    if (keyToEvict != null) remove(keyToEvict);
  }
}

class LinkedList<T> {
  final List<T> _list = [];
  void addLast(T value) => _list.add(value);
  void remove(T value) => _list.remove(value);
  T get first => _list.first;
  void clear() => _list.clear();
}`,
    complexity: 'complex',
    widgets: [],
    category: 'advanced-logic',
    description: 'LRU/LFU/FIFO cache with TTL expiration and hit rate tracking',
  },
];

// ============================================================
// All Sources Combined
// ============================================================

const ALL_LOGIC_SOURCES: CodeSampleSource[] = [
  ...repositorySampleSources,
  ...stateManagementSampleSources,
  ...serviceSampleSources,
  ...modelSampleSources,
  ...utilitySampleSources,
  ...advancedEdgeCaseSources,
];

// ============================================================
// Lazy-loaded Samples (generated on first access)
// ============================================================

let _cachedLogicSamples: CodeSample[] | null = null;

/**
 * Get all logic code samples with COON generated by SDK.
 * Samples are cached after first generation.
 */
export function getAllLogicSamples(): CodeSample[] {
  if (!_cachedLogicSamples) {
    console.log('🔄 Generating COON code for logic samples using SDK...');
    _cachedLogicSamples = ALL_LOGIC_SOURCES.map(toCodeSample);
    console.log(`✅ Generated ${_cachedLogicSamples.length} logic samples with COON compression`);
  }
  return _cachedLogicSamples;
}

// ============================================================
// Logic Sample Getters
// ============================================================

export function getLogicSamplesByCategory(category: string): CodeSample[] {
  return getAllLogicSamples().filter(s => s.category === category);
}

export function getLogicSampleById(id: string): CodeSample | undefined {
  return getAllLogicSamples().find(s => s.id === id);
}

export function getLogicSampleStats() {
  const samples = getAllLogicSamples();
  const categories = [...new Set(samples.map(s => s.category))];
  const byCategory = Object.fromEntries(
    categories.map(c => [c, getLogicSamplesByCategory(c).length])
  );

  const byComplexity = {
    simple: samples.filter(s => s.complexity === 'simple').length,
    medium: samples.filter(s => s.complexity === 'medium').length,
    complex: samples.filter(s => s.complexity === 'complex').length,
  };

  return {
    total: samples.length,
    byCategory,
    byComplexity,
    categories,
  };
}

/**
 * Force regeneration of COON code (useful for testing SDK changes)
 */
export function clearLogicSampleCache(): void {
  _cachedLogicSamples = null;
}

// ============================================================
// Backward compatibility exports
// ============================================================

// Note: These are eagerly evaluated - consider using getAllLogicSamples() for lazy loading
export const ALL_LOGIC_SAMPLES: CodeSample[] = getAllLogicSamples();

// Individual category exports (for backward compatibility)
export const repositorySamples: CodeSample[] = getLogicSamplesByCategory('repository');
export const stateManagementSamples: CodeSample[] = getLogicSamplesByCategory('state-management');
export const serviceSamples: CodeSample[] = getLogicSamplesByCategory('service');
export const modelSamples: CodeSample[] = getLogicSamplesByCategory('model');
export const utilitySamples: CodeSample[] = getLogicSamplesByCategory('utility');

// ============================================================
// Exports for direct access to source definitions
// ============================================================

export {
  repositorySampleSources,
  stateManagementSampleSources,
  serviceSampleSources,
  modelSampleSources,
  utilitySampleSources,
  ALL_LOGIC_SOURCES,
};
