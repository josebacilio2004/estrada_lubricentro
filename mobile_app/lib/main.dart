import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0B0D12),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const EstradaErpMobileApp());
}

// ============================================================================
// SYSTEM DESIGN TOKENS (Idénticos al Sistema Web Lubricentros Estrada)
// ============================================================================
class EstradaTheme {
  static const Color ink950 = Color(0xFF0B0D12);
  static const Color ink900 = Color(0xFF101217);
  static const Color panelBg = Color(0xFF151820);
  static const Color cardBg = Color(0xFF1B1F28);
  static const Color ember500 = Color(0xFFF26A1B);
  static const Color ember600 = Color(0xFFD9560E);
  static const Color amber400 = Color(0xFFF59E0B);
  static const Color emerald400 = Color(0xFF10B981);
  static const Color red400 = Color(0xFFEF4444);
  static const Color textHi = Color(0xFFF9FAFB);
  static const Color textLo = Color(0xFF9CA3AF);
  static const Color textDim = Color(0xFF6B7280);
  static const Color borderSubtle = Color(0x18FFFFFF);
}

class EstradaErpMobileApp extends StatelessWidget {
  const EstradaErpMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lubricentros Estrada ERP',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: EstradaTheme.ink950,
        primaryColor: EstradaTheme.ember500,
        colorScheme: const ColorScheme.dark(
          primary: EstradaTheme.ember500,
          secondary: EstradaTheme.amber400,
          surface: EstradaTheme.panelBg,
          error: EstradaTheme.red400,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const EstradaMainShell(),
    );
  }
}

// ============================================================================
// MODELOS DE DATOS CONECTADOS A POSTGRESQL (CONTENEDOR DOCKER)
// ============================================================================
class ProductModel {
  final String id;
  final String sku;
  final String barcode;
  final String name;
  final String description;
  final String categoryId;
  final String brandId;
  final String presentation;
  final double purchasePrice;
  final double salePrice;
  final double stockCurrent;
  final double stockMin;
  final String imageUrl;
  final String brandName;
  final String categoryName;
  final String viscosity;
  final String oilType;
  final String apiNorm;
  final int lifespanKm;

  ProductModel({
    required this.id,
    required this.sku,
    required this.barcode,
    required this.name,
    required this.description,
    required this.categoryId,
    required this.brandId,
    required this.presentation,
    required this.purchasePrice,
    required this.salePrice,
    required this.stockCurrent,
    required this.stockMin,
    required this.imageUrl,
    required this.brandName,
    required this.categoryName,
    required this.viscosity,
    required this.oilType,
    required this.apiNorm,
    required this.lifespanKm,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final specs = (json['technical_specs'] is Map<String, dynamic>)
        ? json['technical_specs'] as Map<String, dynamic>
        : <String, dynamic>{};
    return ProductModel(
      id: (json['id'] ?? '').toString(),
      sku: (json['sku'] ?? '').toString(),
      barcode: (json['barcode'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      categoryId: (json['category_id'] ?? '').toString(),
      brandId: (json['brand_id'] ?? '').toString(),
      presentation: (json['presentation'] ?? '1 Unidad').toString(),
      purchasePrice: double.tryParse((json['purchase_price'] ?? '0').toString()) ?? 0.0,
      salePrice: double.tryParse((json['sale_price'] ?? '0').toString()) ?? 0.0,
      stockCurrent: double.tryParse((json['stock_current'] ?? '0').toString()) ?? 0.0,
      stockMin: double.tryParse((json['stock_min'] ?? '5').toString()) ?? 5.0,
      imageUrl: (json['image_url'] ?? '/media/line-synthetic.png').toString(),
      brandName: (json['brand_name'] ?? 'Estrada').toString(),
      categoryName: (json['category_name'] ?? 'Lubricantes').toString(),
      viscosity: (specs['viscosity'] ?? '5W-30').toString(),
      oilType: (specs['oil_type'] ?? 'Full Sintético').toString(),
      apiNorm: (specs['api_norm'] ?? 'API SP').toString(),
      lifespanKm: int.tryParse((specs['lifespan_km'] ?? '10000').toString()) ?? 10000,
    );
  }
}

class PosCartItem {
  final ProductModel product;
  int quantity;
  PosCartItem({required this.product, this.quantity = 1});
}

// ============================================================================
// SHELL PRINCIPAL CON LAS 2 FUNCIONALIDADES + CATÁLOGO DE PRODUCTOS
// ============================================================================
class EstradaMainShell extends StatefulWidget {
  const EstradaMainShell({super.key});

  @override
  State<EstradaMainShell> createState() => _EstradaMainShellState();
}

class _EstradaMainShellState extends State<EstradaMainShell> {
  int _selectedIndex = 0;

  // Presets de conexión hacia el contenedor Docker (Caddy :8088 / Go API :8085)
  static const String defaultTunnelUrl =
      'https://sharing-carbon-trade-certificate.trycloudflare.com';
  static const String defaultLanUrl = 'http://192.168.1.8:8088';
  static const String defaultEmulatorUrl = 'http://10.0.2.2:8088';

  String _baseUrl = defaultTunnelUrl;
  bool _isConnected = false;
  bool _checkingConnection = true;

  List<ProductModel> _products = [];
  List<Map<String, String>> _categories = [];
  List<Map<String, String>> _brands = [];
  final List<PosCartItem> _posCart = [];

  @override
  void initState() {
    super.initState();
    _initConnectionAndLoad();
  }

  Future<void> _initConnectionAndLoad() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString('estrada_api_base_url');

    final candidates = <String>[
      if (savedUrl != null && savedUrl.isNotEmpty) savedUrl,
      defaultTunnelUrl,
      defaultLanUrl,
      defaultEmulatorUrl,
    ];

    for (final candidate in candidates) {
      final ok = await _pingServer(candidate);
      if (ok) {
        setState(() {
          _baseUrl = candidate;
          _isConnected = true;
          _checkingConnection = false;
        });
        await prefs.setString('estrada_api_base_url', candidate);
        await _loadAllData();
        return;
      }
    }

    setState(() {
      _checkingConnection = false;
      _isConnected = false;
    });
    await _loadAllData();
  }

  Future<bool> _pingServer(String url) async {
    try {
      final clean = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
      final res = await http
          .get(Uri.parse('$clean/v1/health'))
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['success'] == true;
      }
    } catch (_) {}
    return false;
  }

  String resolveImageUrl(String rawUrl) {
    if (rawUrl.isEmpty) {
      return '$_baseUrl/media/line-synthetic.png';
    }
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    final cleanBase =
        _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
    final cleanPath = rawUrl.startsWith('/') ? rawUrl : '/$rawUrl';
    return '$cleanBase$cleanPath';
  }

  Future<void> _loadAllData() async {
    await Future.wait([
      _fetchProducts(),
      _fetchCategories(),
      _fetchBrands(),
    ]);
  }

  Future<void> _fetchProducts({String query = ''}) async {
    try {
      final clean =
          _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
      final res = await http
          .get(Uri.parse('$clean/v1/products?q=${Uri.encodeComponent(query)}'))
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] is List) {
          final list = (body['data'] as List)
              .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
              .toList();
          if (mounted) {
            setState(() {
              _products = list;
              _isConnected = true;
            });
          }
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isConnected = false);
      }
    }
  }

  Future<void> _fetchCategories() async {
    try {
      final clean =
          _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
      final res = await http.get(Uri.parse('$clean/v1/categories'));
      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] is List) {
          final list = (body['data'] as List)
              .map((e) => {
                    'id': (e['id'] ?? '').toString(),
                    'name': (e['name'] ?? '').toString(),
                  })
              .toList();
          if (mounted) setState(() => _categories = list);
        }
      }
    } catch (_) {}
  }

  Future<void> _fetchBrands() async {
    try {
      final clean =
          _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
      final res = await http.get(Uri.parse('$clean/v1/brands'));
      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] is List) {
          final list = (body['data'] as List)
              .map((e) => {
                    'id': (e['id'] ?? '').toString(),
                    'name': (e['name'] ?? '').toString(),
                  })
              .toList();
          if (mounted) setState(() => _brands = list);
        }
      }
    } catch (_) {}
  }

  void _showServerSettingsDialog() {
    final ctrl = TextEditingController(text: _baseUrl);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EstradaTheme.panelBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.dns_rounded, color: EstradaTheme.ember500, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'CONEXIÓN A CONTENEDORES DOCKER',
                    style: TextStyle(
                      color: EstradaTheme.ember500,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close, color: EstradaTheme.textLo),
                  ),
                ],
              ),
              const Text(
                'Servidor PostgreSQL + API Core Go',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Seleccione el punto de enlace hacia los contenedores de Lubricentros Estrada:',
                style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _presetChip('Túnel Cloudflare (Internet)', defaultTunnelUrl, ctrl),
                  _presetChip('Wi-Fi Local (192.168.1.8)', defaultLanUrl, ctrl),
                  _presetChip('Emulador Android', defaultEmulatorUrl, ctrl),
                ],
              ),
              const SizedBox(height: 14),
              TextField(
                controller: ctrl,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
                decoration: InputDecoration(
                  labelText: 'URL del Servidor (Caddy :8088 o Túnel HTTPS)',
                  labelStyle: const TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                  filled: true,
                  fillColor: EstradaTheme.ink950,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: EstradaTheme.borderSubtle),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: EstradaTheme.ember500,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  onPressed: () async {
                    final newUrl = ctrl.text.trim();
                    if (newUrl.isEmpty) return;
                    Navigator.pop(ctx);
                    setState(() {
                      _baseUrl = newUrl;
                      _checkingConnection = true;
                    });
                    final ok = await _pingServer(newUrl);
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.setString('estrada_api_base_url', newUrl);
                    setState(() {
                      _isConnected = ok;
                      _checkingConnection = false;
                    });
                    await _loadAllData();
                  },
                  icon: const Icon(Icons.sync_rounded, size: 18),
                  label: const Text(
                    'GUARDAR Y SINCRONIZAR CON CONTENEDOR',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _presetChip(String label, String url, TextEditingController ctrl) {
    return ActionChip(
      backgroundColor: EstradaTheme.cardBg,
      side: const BorderSide(color: EstradaTheme.borderSubtle),
      label: Text(label, style: const TextStyle(color: Colors.white, fontSize: 11)),
      onPressed: () => ctrl.text = url,
    );
  }

  // Abre el modal para Crear o Editar un Producto con soporte de Cámara/Galería y Enlace URL
  void _openProductEditorModal({ProductModel? existing, String? prefilledBarcode}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EstradaTheme.ink950,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => ProductEditorSheet(
        baseUrl: _baseUrl,
        resolveImageUrl: resolveImageUrl,
        existingProduct: existing,
        prefilledBarcode: prefilledBarcode,
        categories: _categories,
        brands: _brands,
        onSaved: () {
          _fetchProducts();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: EstradaTheme.ink950,
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: const Text(
                'E',
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: const TextSpan(
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                      color: Colors.white,
                    ),
                    children: [
                      TextSpan(text: 'ESTRAD'),
                      TextSpan(
                        text: 'A',
                        style: TextStyle(color: EstradaTheme.ember500),
                      ),
                      TextSpan(
                        text: ' ERP',
                        style: TextStyle(
                          color: EstradaTheme.textLo,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _checkingConnection
                            ? EstradaTheme.amber400
                            : (_isConnected ? EstradaTheme.emerald400 : EstradaTheme.red400),
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _checkingConnection
                          ? 'Conectando a PostgreSQL...'
                          : (_isConnected
                              ? 'PostgreSQL Docker Online (${_products.length} SKUs)'
                              : 'Sin conexión — Toque el ícono de red'),
                      style: const TextStyle(
                        fontSize: 10,
                        color: EstradaTheme.textLo,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refrescar Base de Datos',
            onPressed: _loadAllData,
            icon: const Icon(Icons.refresh_rounded, color: EstradaTheme.textLo, size: 20),
          ),
          IconButton(
            tooltip: 'Configurar Servidor Docker',
            onPressed: _showServerSettingsDialog,
            icon: Icon(
              Icons.settings_ethernet_rounded,
              color: _isConnected ? EstradaTheme.emerald400 : EstradaTheme.amber400,
              size: 20,
            ),
          ),
          const SizedBox(width: 4),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: EstradaTheme.borderSubtle),
        ),
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          // TAB 1: FUNCIONALIDAD 1 - ESCANEAR PRODUCTOS PARA SINCRONIZAR INVENTARIO
          InventoryScannerView(
            baseUrl: _baseUrl,
            products: _products,
            resolveImageUrl: resolveImageUrl,
            onRefreshProducts: _fetchProducts,
            onOpenProductEditor: _openProductEditorModal,
          ),

          // TAB 2: FUNCIONALIDAD 2 - ESCANEAR EN VENTA -> CARGA AUTOMÁTICA EN POS WEB + DESCUENTO DE STOCK
          PosScannerLiveView(
            baseUrl: _baseUrl,
            products: _products,
            cart: _posCart,
            resolveImageUrl: resolveImageUrl,
            onCartChanged: () => setState(() {}),
            onSaleCompleted: () {
              setState(() => _posCart.clear());
              _fetchProducts();
            },
          ),

          // TAB 3: CATÁLOGO DE PRODUCTOS & EDITOR CON FOTO DESDE CELULAR O ENLACE URL
          CatalogManagerView(
            baseUrl: _baseUrl,
            products: _products,
            resolveImageUrl: resolveImageUrl,
            onRefresh: _fetchProducts,
            onEditProduct: (prod) => _openProductEditorModal(existing: prod),
            onCreateProduct: () => _openProductEditorModal(),
            onSendToPosWeb: (prod) async {
              await _sendProductToPosWeb(prod);
            },
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: EstradaTheme.panelBg,
          border: Border(top: BorderSide(color: EstradaTheme.borderSubtle)),
        ),
        child: NavigationBar(
          height: 68,
          backgroundColor: EstradaTheme.panelBg,
          indicatorColor: EstradaTheme.ember500.withValues(alpha: 0.2),
          selectedIndex: _selectedIndex,
          onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
          destinations: [
            const NavigationDestination(
              icon: Icon(Icons.qr_code_scanner_rounded, color: EstradaTheme.textLo),
              selectedIcon: Icon(Icons.qr_code_scanner_rounded, color: EstradaTheme.ember500),
              label: '1. Sinc. Inventario',
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: _posCart.isNotEmpty,
                backgroundColor: EstradaTheme.ember500,
                label: Text('${_posCart.fold<int>(0, (a, b) => a + b.quantity)}'),
                child: const Icon(Icons.point_of_sale_rounded, color: EstradaTheme.textLo),
              ),
              selectedIcon: Badge(
                isLabelVisible: _posCart.isNotEmpty,
                backgroundColor: EstradaTheme.ember500,
                label: Text('${_posCart.fold<int>(0, (a, b) => a + b.quantity)}'),
                child: const Icon(Icons.point_of_sale_rounded, color: EstradaTheme.ember500),
              ),
              label: '2. Escáner POS',
            ),
            const NavigationDestination(
              icon: Icon(Icons.inventory_2_outlined, color: EstradaTheme.textLo),
              selectedIcon: Icon(Icons.inventory_2_rounded, color: EstradaTheme.ember500),
              label: '3. Productos & Fotos',
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendProductToPosWeb(ProductModel prod) async {
    try {
      final clean =
          _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
      final res = await http.post(
        Uri.parse('$clean/v1/pos/scan'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'barcode': prod.barcode.isNotEmpty ? prod.barcode : prod.sku,
          'quantity': 1,
          'session_id': 'MAIN',
        }),
      );
      if (res.statusCode == 200) {
        setState(() {
          final existing = _posCart.where((i) => i.product.id == prod.id).toList();
          if (existing.isNotEmpty) {
            existing.first.quantity += 1;
          } else {
            _posCart.add(PosCartItem(product: prod, quantity: 1));
          }
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: EstradaTheme.emerald400,
              content: Text(
                'Cargado en POS Web: ${prod.name}',
                style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
              ),
            ),
          );
        }
      }
    } catch (_) {}
  }
}

// ============================================================================
// PESTAÑA 1: FUNCIONALIDAD 1 - ESCANEAR PRODUCTOS PARA SINCRONIZAR INVENTARIO
// ============================================================================
class InventoryScannerView extends StatefulWidget {
  final String baseUrl;
  final List<ProductModel> products;
  final String Function(String) resolveImageUrl;
  final Future<void> Function({String query}) onRefreshProducts;
  final void Function({ProductModel? existing, String? prefilledBarcode}) onOpenProductEditor;

  const InventoryScannerView({
    super.key,
    required this.baseUrl,
    required this.products,
    required this.resolveImageUrl,
    required this.onRefreshProducts,
    required this.onOpenProductEditor,
  });

  @override
  State<InventoryScannerView> createState() => _InventoryScannerViewState();
}

class _InventoryScannerViewState extends State<InventoryScannerView> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );
  final TextEditingController _manualCodeCtrl = TextEditingController();

  bool _cameraExpanded = true;
  bool _isProcessingScan = false;
  DateTime? _lastScanTime;
  ProductModel? _scannedProduct;
  String? _lastScannedCode;

  @override
  void dispose() {
    _scannerController.dispose();
    _manualCodeCtrl.dispose();
    super.dispose();
  }

  Future<void> _lookupBarcode(String rawCode) async {
    final code = rawCode.trim();
    if (code.isEmpty || _isProcessingScan) return;

    final now = DateTime.now();
    if (_lastScanTime != null &&
        _lastScannedCode == code &&
        now.difference(_lastScanTime!).inSeconds < 3) {
      return;
    }
    _lastScanTime = now;
    _lastScannedCode = code;

    setState(() => _isProcessingScan = true);
    HapticFeedback.mediumImpact();

    try {
      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;
      final res = await http.get(
        Uri.parse('$clean/v1/products/barcode/${Uri.encodeComponent(code)}'),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(utf8.decode(res.bodyBytes));
        if (body['success'] == true && body['data'] != null) {
          final data = body['data'];
          if (data['found'] == true && data['product'] != null) {
            final prod = ProductModel.fromJson(data['product'] as Map<String, dynamic>);
            setState(() => _scannedProduct = prod);
            _showInventorySyncSheet(prod);
          } else {
            // Código de barras no registrado aún -> ofrecer crearlo con foto desde el celular
            if (mounted) {
              _showNewBarcodeDialog(code);
            }
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: EstradaTheme.red400,
            content: Text('Error consultando código en PostgreSQL: $e'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessingScan = false);
      }
    }
  }

  void _showNewBarcodeDialog(String barcode) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: EstradaTheme.panelBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.add_box_rounded, color: EstradaTheme.ember500),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                'Código Nuevo Detectado',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Text(
          'El código "$barcode" aún no existe en el inventario de PostgreSQL.\n\n¿Desea registrarlo ahora mismo y tomarle una fotografía con el celular?',
          style: const TextStyle(color: EstradaTheme.textLo, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: EstradaTheme.textLo)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: EstradaTheme.ember500,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(ctx);
              widget.onOpenProductEditor(prefilledBarcode: barcode);
            },
            icon: const Icon(Icons.camera_alt_rounded, size: 16),
            label: const Text('Registrar Producto'),
          ),
        ],
      ),
    );
  }

  void _showInventorySyncSheet(ProductModel prod) {
    final qtyCtrl = TextEditingController(text: '6');
    final notesCtrl = TextEditingController(text: 'Sincronización por Escáner Móvil');
    String movType = 'IN_PURCHASE';
    bool saving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EstradaTheme.panelBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: EstradaTheme.emerald400.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'SKU: ${prod.sku}',
                          style: const TextStyle(
                            color: EstradaTheme.emerald400,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (prod.barcode.isNotEmpty)
                        Text(
                          'EAN: ${prod.barcode}',
                          style: const TextStyle(
                            color: EstradaTheme.textLo,
                            fontSize: 11,
                            fontFamily: 'monospace',
                          ),
                        ),
                      const Spacer(),
                      TextButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          widget.onOpenProductEditor(existing: prod);
                        },
                        icon: const Icon(Icons.edit_rounded, size: 15, color: EstradaTheme.amber400),
                        label: const Text(
                          'Editar / Foto',
                          style: TextStyle(color: EstradaTheme.amber400, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 64,
                          height: 64,
                          color: EstradaTheme.ink950,
                          child: Image.network(
                            widget.resolveImageUrl(prod.imageUrl),
                            fit: BoxFit.contain,
                            errorBuilder: (_, _, _) => const Icon(
                              Icons.oil_barrel_rounded,
                              color: EstradaTheme.ember500,
                              size: 32,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              prod.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${prod.brandName} • ${prod.presentation}',
                              style: const TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Text(
                                  'Stock Actual: ${prod.stockCurrent.toStringAsFixed(0)} unid.',
                                  style: const TextStyle(
                                    color: EstradaTheme.emerald400,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  'S/ ${prod.salePrice.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    color: EstradaTheme.ember500,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 13,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: EstradaTheme.borderSubtle, height: 24),
                  const Text(
                    'OPERACIÓN DE SINCRONIZACIÓN KARDEX:',
                    style: TextStyle(
                      color: EstradaTheme.textLo,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _movTypeChip(
                        label: '+ Ingreso Compra',
                        value: 'IN_PURCHASE',
                        current: movType,
                        onSelect: (v) => setSheetState(() => movType = v),
                      ),
                      _movTypeChip(
                        label: '= Fijar Stock Exacto',
                        value: 'SET_STOCK',
                        current: movType,
                        onSelect: (v) => setSheetState(() {
                          movType = v;
                          qtyCtrl.text = prod.stockCurrent.toStringAsFixed(0);
                        }),
                      ),
                      _movTypeChip(
                        label: '- Salida / Ajuste',
                        value: 'ADJUSTMENT_NEG',
                        current: movType,
                        onSelect: (v) => setSheetState(() => movType = v),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: qtyCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                          decoration: InputDecoration(
                            labelText: movType == 'SET_STOCK' ? 'Nuevo Stock Total' : 'Cantidad Unid.',
                            labelStyle: const TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                            filled: true,
                            fillColor: EstradaTheme.ink950,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 3,
                        child: TextField(
                          controller: notesCtrl,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            labelText: 'Referencia Kardex',
                            labelStyle: const TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                            filled: true,
                            fillColor: EstradaTheme.ink950,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: EstradaTheme.ember500,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: saving
                          ? null
                          : () async {
                              final qty = double.tryParse(qtyCtrl.text.trim()) ?? 0;
                              if (qty <= 0 && movType != 'SET_STOCK') return;
                              setSheetState(() => saving = true);

                              try {
                                final clean = widget.baseUrl.endsWith('/')
                                    ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
                                    : widget.baseUrl;
                                final res = await http.post(
                                  Uri.parse('$clean/v1/inventory/scan-sync'),
                                  headers: {'Content-Type': 'application/json'},
                                  body: jsonEncode({
                                    'product_id': prod.id,
                                    'movement_type': movType,
                                    'quantity': qty,
                                    'unit_cost': prod.purchasePrice,
                                    'notes': notesCtrl.text.trim(),
                                  }),
                                );
                                final body = jsonDecode(utf8.decode(res.bodyBytes));
                                if (res.statusCode == 200 && body['success'] == true) {
                                  if (ctx.mounted) Navigator.pop(ctx);
                                  await widget.onRefreshProducts();
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        backgroundColor: EstradaTheme.emerald400,
                                        content: Text(
                                          'Stock sincronizado en Web y BD: ${body['data']['stock_after']} unidades',
                                          style: const TextStyle(
                                            color: Colors.black,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    );
                                  }
                                } else {
                                  throw Exception(body['error']?['message'] ?? 'Error al sincronizar');
                                }
                              } catch (err) {
                                if (ctx.mounted) {
                                  ScaffoldMessenger.of(ctx).showSnackBar(
                                    SnackBar(
                                      backgroundColor: EstradaTheme.red400,
                                      content: Text('$err'),
                                    ),
                                  );
                                }
                              } finally {
                                if (ctx.mounted) setSheetState(() => saving = false);
                              }
                            },
                      icon: const Icon(Icons.cloud_upload_rounded, size: 18),
                      label: Text(
                        saving
                            ? 'SINCRONIZANDO CON POSTGRESQL...'
                            : 'GUARDAR Y SINCRONIZAR INVENTARIO WEB',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _movTypeChip({
    required String label,
    required String value,
    required String current,
    required void Function(String) onSelect,
  }) {
    final selected = current == value;
    return ChoiceChip(
      label: Text(
        label,
        style: TextStyle(
          color: selected ? Colors.black : Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 11,
        ),
      ),
      selected: selected,
      selectedColor: EstradaTheme.amber400,
      backgroundColor: EstradaTheme.cardBg,
      onSelected: (_) => onSelect(value),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Encabezado de Funcionalidad 1
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: EstradaTheme.panelBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: EstradaTheme.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: EstradaTheme.ember500.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'MÓDULO 1 • KARDEX & ALMACÉN',
                      style: TextStyle(
                        color: EstradaTheme.ember500,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                  const Spacer(),
                  TextButton.icon(
                    onPressed: () => setState(() => _cameraExpanded = !_cameraExpanded),
                    icon: Icon(
                      _cameraExpanded ? Icons.videocam_off_rounded : Icons.videocam_rounded,
                      size: 16,
                      color: EstradaTheme.amber400,
                    ),
                    label: Text(
                      _cameraExpanded ? 'Ocultar Cámara' : 'Abrir Cámara',
                      style: const TextStyle(color: EstradaTheme.amber400, fontSize: 11),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Escáner de Sincronización de Inventario',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Apunte al código de barras del lubricante o filtro para actualizar stock en tiempo real, editar datos o dar de alta un nuevo producto con fotografía.',
                style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
              ),
              if (_cameraExpanded) ...[
                const SizedBox(height: 14),
                ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: SizedBox(
                    height: 220,
                    width: double.infinity,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        MobileScanner(
                          controller: _scannerController,
                          onDetect: (capture) {
                            for (final barcode in capture.barcodes) {
                              final raw = barcode.rawValue;
                              if (raw != null && raw.isNotEmpty) {
                                _lookupBarcode(raw);
                                break;
                              }
                            }
                          },
                        ),
                        // Marco de mira láser estilo Estrada
                        Container(
                          width: 220,
                          height: 120,
                          decoration: BoxDecoration(
                            border: Border.all(color: EstradaTheme.ember500, width: 2),
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        Positioned(
                          top: 10,
                          right: 10,
                          child: IconButton(
                            style: IconButton.styleFrom(backgroundColor: Colors.black54),
                            onPressed: () => _scannerController.toggleTorch(),
                            icon: const Icon(Icons.flash_on_rounded, color: EstradaTheme.amber400),
                          ),
                        ),
                        Positioned(
                          bottom: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black87,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _isProcessingScan
                                  ? 'Consultando PostgreSQL...'
                                  : 'EAN-13 • CODE-128 • QR ACTIVO',
                              style: const TextStyle(
                                color: EstradaTheme.ember500,
                                fontSize: 10,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 12),
              // Buscador / Lector manual de código
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _manualCodeCtrl,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontFamily: 'monospace',
                      ),
                      decoration: InputDecoration(
                        hintText: 'Ingresar código de barras o SKU (ej. 7501001234567)...',
                        hintStyle: const TextStyle(color: EstradaTheme.textDim, fontSize: 11),
                        filled: true,
                        fillColor: EstradaTheme.ink950,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: EstradaTheme.borderSubtle),
                        ),
                      ),
                      onSubmitted: (val) => _lookupBarcode(val),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: EstradaTheme.ember500,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => _lookupBarcode(_manualCodeCtrl.text),
                    child: const Text('BUSCAR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),
        Row(
          children: [
            const Text(
              'INVENTARIO SINCRONIZADO EN TIEMPO REAL',
              style: TextStyle(
                color: EstradaTheme.textLo,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
              ),
            ),
            const Spacer(),
            TextButton.icon(
              onPressed: () => widget.onOpenProductEditor(),
              icon: const Icon(Icons.add_a_photo_rounded, size: 15, color: EstradaTheme.ember500),
              label: const Text(
                '+ Nuevo con Foto',
                style: TextStyle(color: EstradaTheme.ember500, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),

        ...widget.products.map((prod) {
          final isLow = prod.stockCurrent <= prod.stockMin;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: EstradaTheme.panelBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: _scannedProduct?.id == prod.id
                    ? EstradaTheme.ember500
                    : EstradaTheme.borderSubtle,
              ),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              leading: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 48,
                  height: 48,
                  color: EstradaTheme.ink950,
                  child: Image.network(
                    widget.resolveImageUrl(prod.imageUrl),
                    fit: BoxFit.contain,
                    errorBuilder: (_, _, _) =>
                        const Icon(Icons.oil_barrel_rounded, color: EstradaTheme.ember500),
                  ),
                ),
              ),
              title: Text(
                prod.name,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 3),
                  Text(
                    'SKU: ${prod.sku} • EAN: ${prod.barcode.isEmpty ? "S/N" : prod.barcode}',
                    style: const TextStyle(
                      color: EstradaTheme.textLo,
                      fontSize: 10,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: isLow
                              ? EstradaTheme.amber400.withValues(alpha: 0.15)
                              : EstradaTheme.emerald400.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'Stock: ${prod.stockCurrent.toStringAsFixed(0)} unid.',
                          style: TextStyle(
                            color: isLow ? EstradaTheme.amber400 : EstradaTheme.emerald400,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'S/ ${prod.salePrice.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              trailing: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: EstradaTheme.cardBg,
                  foregroundColor: EstradaTheme.amber400,
                  side: const BorderSide(color: EstradaTheme.borderSubtle),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => _showInventorySyncSheet(prod),
                child: const Text(
                  'Sinc. Stock',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }
}

// ============================================================================
// PESTAÑA 2: FUNCIONALIDAD 2 - ESCANEAR EN VENTA -> CARGA AUTOMÁTICA EN POS WEB
// ============================================================================
class PosScannerLiveView extends StatefulWidget {
  final String baseUrl;
  final List<ProductModel> products;
  final List<PosCartItem> cart;
  final String Function(String) resolveImageUrl;
  final VoidCallback onCartChanged;
  final VoidCallback onSaleCompleted;

  const PosScannerLiveView({
    super.key,
    required this.baseUrl,
    required this.products,
    required this.cart,
    required this.resolveImageUrl,
    required this.onCartChanged,
    required this.onSaleCompleted,
  });

  @override
  State<PosScannerLiveView> createState() => _PosScannerLiveViewState();
}

class _PosScannerLiveViewState extends State<PosScannerLiveView> {
  final MobileScannerController _posScannerCtrl = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );

  bool _cameraActive = true;
  bool _sendingScan = false;
  DateTime? _lastPosScanTime;
  String? _lastPosCode;
  String? _lastSyncedMessage;

  @override
  void dispose() {
    _posScannerCtrl.dispose();
    super.dispose();
  }

  Future<void> _scanAndPushToWebPos(String code) async {
    final cleanCode = code.trim();
    if (cleanCode.isEmpty || _sendingScan) return;

    final now = DateTime.now();
    if (_lastPosScanTime != null &&
        _lastPosCode == cleanCode &&
        now.difference(_lastPosScanTime!).inMilliseconds < 1800) {
      return;
    }
    _lastPosScanTime = now;
    _lastPosCode = cleanCode;

    setState(() => _sendingScan = true);
    HapticFeedback.heavyImpact();

    try {
      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;

      final res = await http.post(
        Uri.parse('$clean/v1/pos/scan'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'barcode': cleanCode,
          'quantity': 1,
          'session_id': 'MAIN',
        }),
      );

      final body = jsonDecode(utf8.decode(res.bodyBytes));
      if (res.statusCode == 200 && body['success'] == true) {
        final prod = ProductModel.fromJson(body['data']['product'] as Map<String, dynamic>);
        final existing = widget.cart.where((i) => i.product.id == prod.id).toList();
        if (existing.isNotEmpty) {
          existing.first.quantity += 1;
        } else {
          widget.cart.add(PosCartItem(product: prod, quantity: 1));
        }
        widget.onCartChanged();
        setState(() {
          _lastSyncedMessage = 'Cargado en POS Web: ${prod.name} (S/ ${prod.salePrice.toStringAsFixed(2)})';
        });
      } else {
        final msg = body['error']?['message'] ?? 'Código no encontrado en inventario';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(backgroundColor: EstradaTheme.red400, content: Text(msg.toString())),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: EstradaTheme.red400, content: Text('Error de red: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _sendingScan = false);
    }
  }

  void _openCheckoutSheet() {
    if (widget.cart.isEmpty) return;

    final docCtrl = TextEditingController(text: '10458923');
    final nameCtrl = TextEditingController(text: 'CLIENTE MOSTRADOR ESTRADA');
    final plateCtrl = TextEditingController(text: 'ABC-123');
    String docType = '03'; // 03=Boleta, 01=Factura, 80=Nota de Venta
    String paymentMethod = 'EFECTIVO';
    bool processing = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EstradaTheme.panelBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final total = widget.cart.fold<double>(
              0,
              (acc, item) => acc + (item.product.salePrice * item.quantity),
            );
            final subtotal = total / 1.18;
            final igv = total - subtotal;

            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'EMISIÓN ELECTRÓNICA SUNAT & DESCUENTO DE STOCK',
                    style: TextStyle(
                      color: EstradaTheme.ember500,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Total a Cobrar: S/ ${total.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                    ),
                  ),
                  Text(
                    'Gravado: S/ ${subtotal.toStringAsFixed(2)} • IGV (18%): S/ ${igv.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: EstradaTheme.textLo,
                      fontSize: 11,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    children: [
                      ChoiceChip(
                        label: const Text('Boleta (B001)'),
                        selected: docType == '03',
                        selectedColor: EstradaTheme.ember500,
                        onSelected: (_) => setModalState(() => docType = '03'),
                      ),
                      ChoiceChip(
                        label: const Text('Factura (F001)'),
                        selected: docType == '01',
                        selectedColor: EstradaTheme.ember500,
                        onSelected: (_) => setModalState(() => docType = '01'),
                      ),
                      ChoiceChip(
                        label: const Text('Ticket (NV01)'),
                        selected: docType == '80',
                        selectedColor: EstradaTheme.ember500,
                        onSelected: (_) => setModalState(() => docType = '80'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: docCtrl,
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
                          decoration: InputDecoration(
                            labelText: docType == '01' ? 'RUC Cliente' : 'DNI Cliente',
                            filled: true,
                            fillColor: EstradaTheme.ink950,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: plateCtrl,
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
                          decoration: InputDecoration(
                            labelText: 'Placa Vehículo',
                            filled: true,
                            fillColor: EstradaTheme.ink950,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: nameCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Nombre o Razón Social',
                      filled: true,
                      fillColor: EstradaTheme.ink950,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: ['EFECTIVO', 'YAPE_PLIN', 'TARJETA'].map((m) {
                      return ChoiceChip(
                        label: Text(m, style: const TextStyle(fontSize: 11)),
                        selected: paymentMethod == m,
                        selectedColor: EstradaTheme.amber400,
                        labelStyle: TextStyle(
                          color: paymentMethod == m ? Colors.black : Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        onSelected: (_) => setModalState(() => paymentMethod = m),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: EstradaTheme.emerald400,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: processing
                          ? null
                          : () async {
                              setModalState(() => processing = true);
                              try {
                                final clean = widget.baseUrl.endsWith('/')
                                    ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
                                    : widget.baseUrl;
                                final series = docType == '01'
                                    ? 'F001'
                                    : (docType == '03' ? 'B001' : 'NV01');

                                final payload = {
                                  'doc_type_code': docType,
                                  'series': series,
                                  'payment_method': paymentMethod,
                                  'payment_condition': 'CONTADO',
                                  'customer': {
                                    'doc_type_code': docType == '01' ? '6' : '1',
                                    'doc_number': docCtrl.text.trim(),
                                    'full_name_or_business_name': nameCtrl.text.trim(),
                                    'fiscal_address': 'HUANCAYO, JUNÍN',
                                  },
                                  if (plateCtrl.text.trim().isNotEmpty)
                                    'vehicle': {
                                      'license_plate': plateCtrl.text.trim().toUpperCase(),
                                      'brand': 'Toyota',
                                      'model': 'Particular',
                                      'usage_profile': 'PARTICULAR',
                                      'current_km': 48500,
                                    },
                                  'items': widget.cart
                                      .map((item) => {
                                            'product_id': item.product.id,
                                            'description': item.product.name,
                                            'quantity': item.quantity,
                                            'unit_price': item.product.salePrice,
                                          })
                                      .toList(),
                                };

                                final res = await http.post(
                                  Uri.parse('$clean/v1/sales'),
                                  headers: {'Content-Type': 'application/json'},
                                  body: jsonEncode(payload),
                                );
                                final body = jsonDecode(utf8.decode(res.bodyBytes));
                                if ((res.statusCode == 201 || res.statusCode == 200) &&
                                    body['success'] == true) {
                                  final fullNum = body['data']['full_number'] ?? '';
                                  if (ctx.mounted) Navigator.pop(ctx);
                                  widget.onSaleCompleted();
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        backgroundColor: EstradaTheme.emerald400,
                                        duration: const Duration(seconds: 5),
                                        content: Text(
                                          '¡Venta cerrada ($fullNum)! Stock descontado automáticamente en PostgreSQL.',
                                          style: const TextStyle(
                                            color: Colors.black,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    );
                                  }
                                } else {
                                  throw Exception(body['error']?['message'] ?? 'Fallo en venta');
                                }
                              } catch (err) {
                                if (ctx.mounted) {
                                  ScaffoldMessenger.of(ctx).showSnackBar(
                                    SnackBar(
                                      backgroundColor: EstradaTheme.red400,
                                      content: Text('$err'),
                                    ),
                                  );
                                }
                              } finally {
                                if (ctx.mounted) setModalState(() => processing = false);
                              }
                            },
                      icon: const Icon(Icons.check_circle_rounded, size: 20),
                      label: Text(
                        processing
                            ? 'PROCESANDO Y DESCONTANDO STOCK...'
                            : 'CERRAR VENTA Y DESCONTAR DEL INVENTARIO',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.cart.fold<double>(
      0,
      (acc, i) => acc + (i.product.salePrice * i.quantity),
    );

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Panel de Escáner en Vivo hacia el POS Web
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: EstradaTheme.panelBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: EstradaTheme.borderSubtle),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: EstradaTheme.amber400.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'MÓDULO 2 • PISTOLA LÁSER POS WEB',
                            style: TextStyle(
                              color: EstradaTheme.amber400,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                        const Spacer(),
                        Switch(
                          value: _cameraActive,
                          activeThumbColor: EstradaTheme.ember500,
                          onChanged: (v) => setState(() => _cameraActive = v),
                        ),
                      ],
                    ),
                    const Text(
                      'Escaneo Automático al POS Web',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Cada código escaneado aquí se carga automáticamente en la pantalla del POS Web (/admin/pos) y se descuenta del inventario al cerrar la venta.',
                      style: TextStyle(color: EstradaTheme.textLo, fontSize: 12),
                    ),
                    if (_lastSyncedMessage != null) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: EstradaTheme.emerald400.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: EstradaTheme.emerald400.withValues(alpha: 0.4)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.bolt_rounded, color: EstradaTheme.emerald400, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _lastSyncedMessage!,
                                style: const TextStyle(
                                  color: EstradaTheme.emerald400,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (_cameraActive) ...[
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: SizedBox(
                          height: 185,
                          width: double.infinity,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              MobileScanner(
                                controller: _posScannerCtrl,
                                onDetect: (capture) {
                                  for (final b in capture.barcodes) {
                                    if (b.rawValue != null && b.rawValue!.isNotEmpty) {
                                      _scanAndPushToWebPos(b.rawValue!);
                                      break;
                                    }
                                  }
                                },
                              ),
                              Container(
                                width: 210,
                                height: 100,
                                decoration: BoxDecoration(
                                  border: Border.all(color: EstradaTheme.amber400, width: 2),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),
              // Carrito activo sincronizado
              if (widget.cart.isNotEmpty) ...[
                const Text(
                  'CARRITO DE VENTA ACTIVO (SINCRONIZADO CON POS WEB)',
                  style: TextStyle(
                    color: EstradaTheme.amber400,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
                const SizedBox(height: 8),
                ...widget.cart.map((item) => Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: EstradaTheme.cardBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: EstradaTheme.amber400.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.product.name,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                                Text(
                                  'S/ ${item.product.salePrice.toStringAsFixed(2)} c/u • Stock: ${item.product.stockCurrent.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    color: EstradaTheme.textLo,
                                    fontSize: 11,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () {
                              setState(() {
                                if (item.quantity > 1) {
                                  item.quantity -= 1;
                                } else {
                                  widget.cart.remove(item);
                                }
                              });
                              widget.onCartChanged();
                            },
                            icon: const Icon(Icons.remove_circle_outline, color: EstradaTheme.textLo),
                          ),
                          Text(
                            '${item.quantity}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              fontFamily: 'monospace',
                            ),
                          ),
                          IconButton(
                            onPressed: () =>
                                _scanAndPushToWebPos(item.product.barcode.isNotEmpty ? item.product.barcode : item.product.sku),
                            icon: const Icon(Icons.add_circle_outline, color: EstradaTheme.ember500),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 12),
              ],

              const Text(
                'TOQUE RÁPIDO PARA ENVIAR AL POS WEB:',
                style: TextStyle(
                  color: EstradaTheme.textLo,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(height: 8),
              ...widget.products.map((prod) => Card(
                    color: EstradaTheme.panelBg,
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: EstradaTheme.borderSubtle),
                    ),
                    child: ListTile(
                      onTap: () => _scanAndPushToWebPos(
                        prod.barcode.isNotEmpty ? prod.barcode : prod.sku,
                      ),
                      leading: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          width: 42,
                          height: 42,
                          color: EstradaTheme.ink950,
                          child: Image.network(
                            widget.resolveImageUrl(prod.imageUrl),
                            fit: BoxFit.contain,
                            errorBuilder: (_, _, _) => const Icon(
                              Icons.oil_barrel_rounded,
                              color: EstradaTheme.ember500,
                            ),
                          ),
                        ),
                      ),
                      title: Text(
                        prod.name,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        'EAN: ${prod.barcode.isEmpty ? prod.sku : prod.barcode} • Stock: ${prod.stockCurrent.toStringAsFixed(0)}',
                        style: const TextStyle(color: EstradaTheme.textLo, fontSize: 10, fontFamily: 'monospace'),
                      ),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'S/ ${prod.salePrice.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: EstradaTheme.amber400,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              fontFamily: 'monospace',
                            ),
                          ),
                          const Text(
                            '+ Enviar a POS',
                            style: TextStyle(color: EstradaTheme.emerald400, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  )),
            ],
          ),
        ),

        // Barra inferior de Cierre de Venta y Descuento de Inventario
        if (widget.cart.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: EstradaTheme.cardBg,
              border: Border(top: BorderSide(color: EstradaTheme.ember500, width: 1.5)),
            ),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${widget.cart.fold<int>(0, (a, b) => a + b.quantity)} UNIDADES EN POS',
                      style: const TextStyle(
                        color: EstradaTheme.textLo,
                        fontSize: 10,
                        fontFamily: 'monospace',
                      ),
                    ),
                    Text(
                      'S/ ${total.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: EstradaTheme.ember500,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: _openCheckoutSheet,
                  icon: const Icon(Icons.receipt_long_rounded, size: 18),
                  label: const Text(
                    'CERRAR VENTA / COBRAR',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

// ============================================================================
// PESTAÑA 3: CATÁLOGO DE PRODUCTOS & CARGA DE IMAGEN POR CELULAR O ENLACE URL
// ============================================================================
class CatalogManagerView extends StatefulWidget {
  final String baseUrl;
  final List<ProductModel> products;
  final String Function(String) resolveImageUrl;
  final Future<void> Function({String query}) onRefresh;
  final void Function(ProductModel) onEditProduct;
  final VoidCallback onCreateProduct;
  final void Function(ProductModel) onSendToPosWeb;

  const CatalogManagerView({
    super.key,
    required this.baseUrl,
    required this.products,
    required this.resolveImageUrl,
    required this.onRefresh,
    required this.onEditProduct,
    required this.onCreateProduct,
    required this.onSendToPosWeb,
  });

  @override
  State<CatalogManagerView> createState() => _CatalogManagerViewState();
}

class _CatalogManagerViewState extends State<CatalogManagerView> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final filtered = widget.products.where((p) {
      if (_search.isEmpty) return true;
      final q = _search.toLowerCase();
      return p.name.toLowerCase().contains(q) ||
          p.sku.toLowerCase().contains(q) ||
          p.barcode.toLowerCase().contains(q) ||
          p.brandName.toLowerCase().contains(q);
    }).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  onChanged: (v) => setState(() => _search = v),
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search_rounded, color: EstradaTheme.textLo, size: 18),
                    hintText: 'Buscar por nombre, SKU o código...',
                    hintStyle: const TextStyle(color: EstradaTheme.textDim, fontSize: 12),
                    filled: true,
                    fillColor: EstradaTheme.panelBg,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: EstradaTheme.borderSubtle),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: EstradaTheme.ember500,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: widget.onCreateProduct,
                icon: const Icon(Icons.add_a_photo_rounded, size: 16),
                label: const Text('Nuevo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            color: EstradaTheme.ember500,
            onRefresh: () => widget.onRefresh(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filtered.length,
              itemBuilder: (ctx, idx) {
                final p = filtered[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: EstradaTheme.panelBg,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: EstradaTheme.borderSubtle),
                  ),
                  child: Row(
                    children: [
                      GestureDetector(
                        onTap: () => widget.onEditProduct(p),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                width: 68,
                                height: 68,
                                color: EstradaTheme.ink950,
                                child: Image.network(
                                  widget.resolveImageUrl(p.imageUrl),
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, _, _) => const Icon(
                                    Icons.oil_barrel_rounded,
                                    color: EstradaTheme.ember500,
                                    size: 32,
                                  ),
                                ),
                              ),
                            ),
                            Positioned(
                              right: 2,
                              bottom: 2,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: EstradaTheme.ember500,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.camera_alt_rounded, size: 11, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${p.brandName} • ${p.presentation}',
                              style: const TextStyle(color: EstradaTheme.textLo, fontSize: 11),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'SKU: ${p.sku} • Stock: ${p.stockCurrent.toStringAsFixed(0)} unid.',
                              style: const TextStyle(
                                color: EstradaTheme.emerald400,
                                fontSize: 11,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'S/ ${p.salePrice.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: EstradaTheme.amber400,
                              fontWeight: FontWeight.w900,
                              fontSize: 15,
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                tooltip: 'Editar y Cambiar Foto',
                                onPressed: () => widget.onEditProduct(p),
                                icon: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 20),
                              ),
                              IconButton(
                                tooltip: 'Enviar a POS Web',
                                onPressed: () => widget.onSendToPosWeb(p),
                                icon: const Icon(
                                  Icons.add_shopping_cart_rounded,
                                  color: EstradaTheme.ember500,
                                  size: 19,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

// ============================================================================
// MODAL DE CREACIÓN / EDICIÓN DE PRODUCTO CON FOTO DESDE CELULAR Y ENLACE URL
// ============================================================================
class ProductEditorSheet extends StatefulWidget {
  final String baseUrl;
  final String Function(String) resolveImageUrl;
  final ProductModel? existingProduct;
  final String? prefilledBarcode;
  final List<Map<String, String>> categories;
  final List<Map<String, String>> brands;
  final VoidCallback onSaved;

  const ProductEditorSheet({
    super.key,
    required this.baseUrl,
    required this.resolveImageUrl,
    this.existingProduct,
    this.prefilledBarcode,
    required this.categories,
    required this.brands,
    required this.onSaved,
  });

  @override
  State<ProductEditorSheet> createState() => _ProductEditorSheetState();
}

class _ProductEditorSheetState extends State<ProductEditorSheet> {
  final ImagePicker _picker = ImagePicker();
  late final TextEditingController _skuCtrl;
  late final TextEditingController _barcodeCtrl;
  late final TextEditingController _nameCtrl;
  late final TextEditingController _presentationCtrl;
  late final TextEditingController _purchasePriceCtrl;
  late final TextEditingController _salePriceCtrl;
  late final TextEditingController _stockCtrl;
  late final TextEditingController _viscosityCtrl;
  late final TextEditingController _imageUrlCtrl;

  String _selectedCatId = '';
  String _selectedBrandId = '';
  bool _uploadingImage = false;
  bool _savingProduct = false;

  @override
  void initState() {
    super.initState();
    final p = widget.existingProduct;
    _skuCtrl = TextEditingController(
      text: p?.sku ?? 'EST-${DateTime.now().millisecondsSinceEpoch.toString().substring(9)}',
    );
    _barcodeCtrl = TextEditingController(
      text: p?.barcode ?? widget.prefilledBarcode ?? '',
    );
    _nameCtrl = TextEditingController(text: p?.name ?? '');
    _presentationCtrl = TextEditingController(text: p?.presentation ?? '1 Galón (3.78L)');
    _purchasePriceCtrl = TextEditingController(
      text: p != null ? p.purchasePrice.toStringAsFixed(2) : '110.00',
    );
    _salePriceCtrl = TextEditingController(
      text: p != null ? p.salePrice.toStringAsFixed(2) : '155.00',
    );
    _stockCtrl = TextEditingController(
      text: p != null ? p.stockCurrent.toStringAsFixed(0) : '12',
    );
    _viscosityCtrl = TextEditingController(text: p?.viscosity ?? '5W-30');
    _imageUrlCtrl = TextEditingController(text: p?.imageUrl ?? '/media/line-synthetic.png');

    _selectedCatId = p?.categoryId.isNotEmpty == true
        ? p!.categoryId
        : (widget.categories.isNotEmpty ? widget.categories.first['id']! : '');
    _selectedBrandId = p?.brandId.isNotEmpty == true
        ? p!.brandId
        : (widget.brands.isNotEmpty ? widget.brands.first['id']! : '');
  }

  Future<void> _pickAndUploadImage(ImageSource source) async {
    try {
      final XFile? picked = await _picker.pickImage(
        source: source,
        maxWidth: 1080,
        maxHeight: 1080,
        imageQuality: 82,
      );
      if (picked == null) return;

      setState(() => _uploadingImage = true);
      final bytes = await picked.readAsBytes();
      final b64 = base64Encode(bytes);

      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;

      final res = await http.post(
        Uri.parse('$clean/v1/media/upload'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'filename': picked.name,
          'mime_type': 'image/jpeg',
          'base64_data': b64,
        }),
      );

      final body = jsonDecode(utf8.decode(res.bodyBytes));
      if ((res.statusCode == 201 || res.statusCode == 200) && body['success'] == true) {
        final uploadedUrl = body['data']['url'].toString();
        setState(() {
          _imageUrlCtrl.text = uploadedUrl;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: EstradaTheme.emerald400,
              content: Text(
                'Fotografía subida y guardada en PostgreSQL',
                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
              ),
            ),
          );
        }
      } else {
        throw Exception(body['error']?['message'] ?? 'No se pudo subir la imagen');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: EstradaTheme.red400, content: Text('Error al subir foto: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _uploadingImage = false);
    }
  }

  Future<void> _saveProduct() async {
    if (_nameCtrl.text.trim().isEmpty || _skuCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: EstradaTheme.red400,
          content: Text('Nombre y SKU son obligatorios'),
        ),
      );
      return;
    }

    setState(() => _savingProduct = true);
    try {
      final clean = widget.baseUrl.endsWith('/')
          ? widget.baseUrl.substring(0, widget.baseUrl.length - 1)
          : widget.baseUrl;

      final isEditing = widget.existingProduct != null;
      final url = isEditing
          ? '$clean/v1/products/${widget.existingProduct!.id}'
          : '$clean/v1/products';

      final payload = {
        'sku': _skuCtrl.text.trim().toUpperCase(),
        'barcode': _barcodeCtrl.text.trim(),
        'name': _nameCtrl.text.trim(),
        'description': 'Sincronizado desde App Móvil Flutter Estrada',
        if (_selectedCatId.isNotEmpty) 'category_id': _selectedCatId,
        if (_selectedBrandId.isNotEmpty) 'brand_id': _selectedBrandId,
        'presentation': _presentationCtrl.text.trim(),
        'purchase_price': double.tryParse(_purchasePriceCtrl.text.trim()) ?? 0,
        'sale_price': double.tryParse(_salePriceCtrl.text.trim()) ?? 0,
        'stock_current': double.tryParse(_stockCtrl.text.trim()) ?? 0,
        'stock_min': 5,
        'image_url': _imageUrlCtrl.text.trim(),
        'technical_specs': {
          'viscosity': _viscosityCtrl.text.trim(),
          'oil_type': 'Full Sintético',
          'api_norm': 'API SP',
          'lifespan_km': 10000,
        },
      };

      final res = isEditing
          ? await http.put(
              Uri.parse(url),
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode(payload),
            )
          : await http.post(
              Uri.parse(url),
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode(payload),
            );

      final body = jsonDecode(utf8.decode(res.bodyBytes));
      if ((res.statusCode == 200 || res.statusCode == 201) && body['success'] == true) {
        widget.onSaved();
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: EstradaTheme.emerald400,
              content: Text(
                isEditing
                    ? 'Producto actualizado en PostgreSQL y Web'
                    : 'Nuevo producto creado en PostgreSQL y Web',
                style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
              ),
            ),
          );
        }
      } else {
        throw Exception(body['error']?['message'] ?? 'Error al guardar en base de datos');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: EstradaTheme.red400, content: Text('$e')),
        );
      }
    } finally {
      if (mounted) setState(() => _savingProduct = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.existingProduct != null;
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome_rounded, color: EstradaTheme.ember500, size: 18),
                const SizedBox(width: 6),
                Text(
                  isEditing ? 'EDITAR PRODUCTO EN BD' : 'NUEVO PRODUCTO EN BD',
                  style: const TextStyle(
                    color: EstradaTheme.ember500,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: EstradaTheme.textLo),
                ),
              ],
            ),

            // Sección de Fotografía por Celular (Cámara / Galería) o Enlace URL
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: EstradaTheme.panelBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: EstradaTheme.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 72,
                          height: 72,
                          color: EstradaTheme.ink950,
                          child: _uploadingImage
                              ? const Center(
                                  child: CircularProgressIndicator(color: EstradaTheme.ember500),
                                )
                              : Image.network(
                                  widget.resolveImageUrl(_imageUrlCtrl.text),
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, _, _) => const Icon(
                                    Icons.oil_barrel_rounded,
                                    color: EstradaTheme.ember500,
                                    size: 34,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Imagen del Producto (BD PostgreSQL)',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: EstradaTheme.ember500,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                    ),
                                    onPressed: _uploadingImage
                                        ? null
                                        : () => _pickAndUploadImage(ImageSource.camera),
                                    icon: const Icon(Icons.photo_camera_rounded, size: 15),
                                    label: const Text('Cámara', style: TextStyle(fontSize: 11)),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: OutlinedButton.icon(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: Colors.white,
                                      side: const BorderSide(color: EstradaTheme.borderSubtle),
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                    ),
                                    onPressed: _uploadingImage
                                        ? null
                                        : () => _pickAndUploadImage(ImageSource.gallery),
                                    icon: const Icon(Icons.photo_library_rounded, size: 15),
                                    label: const Text('Galería', style: TextStyle(fontSize: 11)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _imageUrlCtrl,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace'),
                    decoration: InputDecoration(
                      labelText: 'O pegar enlace URL de imagen (https://... o /v1/media/...)',
                      labelStyle: const TextStyle(color: EstradaTheme.textLo, fontSize: 11),
                      filled: true,
                      fillColor: EstradaTheme.ink950,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _skuCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace'),
                    decoration: InputDecoration(
                      labelText: 'SKU *',
                      filled: true,
                      fillColor: EstradaTheme.panelBg,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _barcodeCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace'),
                    decoration: InputDecoration(
                      labelText: 'Código de Barras',
                      filled: true,
                      fillColor: EstradaTheme.panelBg,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _nameCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Nombre Comercial del Producto *',
                filled: true,
                fillColor: EstradaTheme.panelBg,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _salePriceCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(
                      color: EstradaTheme.amber400,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      fontFamily: 'monospace',
                    ),
                    decoration: InputDecoration(
                      labelText: 'Precio Venta (S/) *',
                      filled: true,
                      fillColor: EstradaTheme.panelBg,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _stockCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(
                      color: EstradaTheme.emerald400,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      fontFamily: 'monospace',
                    ),
                    decoration: InputDecoration(
                      labelText: 'Stock Actual',
                      filled: true,
                      fillColor: EstradaTheme.panelBg,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _presentationCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      labelText: 'Presentación',
                      filled: true,
                      fillColor: EstradaTheme.panelBg,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _viscosityCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace'),
                    decoration: InputDecoration(
                      labelText: 'Viscosidad SAE',
                      filled: true,
                      fillColor: EstradaTheme.panelBg,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: EstradaTheme.ember500,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: _savingProduct ? null : _saveProduct,
                icon: const Icon(Icons.save_rounded, size: 18),
                label: Text(
                  _savingProduct
                      ? 'GUARDANDO EN POSTGRESQL...'
                      : (isEditing ? 'ACTUALIZAR PRODUCTO EN BD' : 'GUARDAR PRODUCTO EN BD'),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
