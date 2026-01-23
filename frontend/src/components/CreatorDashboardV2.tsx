'use client';

import { useState, useEffect } from 'react';
import {
  useCreator,
  useCreatorContents,
  useContent,
  useRegisterCreator,
  useCreateContent,
  useUpdateContent,
  useCreatorWithdraw,
  usePlatformFee,
  useNextContentId,
} from '@/hooks/usePaywallV2';
import { useExplorer } from '@/hooks/useNetwork';
import { useAccount } from 'wagmi';
import { 
  uploadToIPFS, 
  uploadMetadataToIPFS, 
  storeProductLocal,
  isIPFSConfigured,
  type ProductMetadata 
} from '@/lib/ipfs';

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ============ Product Stats Card ============

function ContentStatsCard({ contentId }: { contentId: bigint }) {
  const { priceEth, revenueEth, unlockCount, enabled, creator, isLoading } = useContent(contentId);
  
  // Get product metadata from storage
  const [productMeta, setProductMeta] = useState<{
    title?: string;
    category?: string;
    thumbnailCID?: string;
  } | null>(null);

  useEffect(() => {
    const id = contentId.toString();
    try {
      // Try new format first (object by contentId)
      const productsObj = JSON.parse(localStorage.getItem('basePaywallProducts') || '{}');
      if (productsObj[id]) {
        setProductMeta(productsObj[id]);
        return;
      }
      
      // Fallback to old array format
      const productsArr = JSON.parse(localStorage.getItem('basePaywallProducts') || '[]');
      if (Array.isArray(productsArr)) {
        const product = productsArr[parseInt(id) - 1];
        if (product) {
          setProductMeta({
            title: product.title,
            category: product.category,
            thumbnailCID: product.thumbnailPreview,
          });
        }
      }
    } catch (e) {
      console.error('Failed to load product metadata:', e);
    }
  }, [contentId]);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-6 bg-gray-700 rounded w-3/4" />
      </div>
    );
  }

  if (!creator || creator === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-500 text-center">Product not found</p>
      </div>
    );
  }

  const categoryEmoji = {
    template: '📄',
    asset: '🎨',
    course: '🎓',
    ebook: '📚',
    software: '💻',
    audio: '🎵',
    other: '📦',
  }[productMeta?.category || 'other'] || '📦';

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 border ${enabled ? 'border-gray-700' : 'border-red-500/30'}`}>
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {productMeta?.thumbnailCID ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700">
            <img src={productMeta.thumbnailCID} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-2xl">
            {categoryEmoji}
          </div>
        )}
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-medium truncate">
              {productMeta?.title || `Product #${contentId.toString()}`}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ml-2 ${enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="bg-gray-900/50 rounded px-2 py-1">
              <p className="text-gray-500 text-xs">Price</p>
              <p className="text-white font-medium text-sm">{priceEth} ETH</p>
            </div>
            <div className="bg-gray-900/50 rounded px-2 py-1">
              <p className="text-gray-500 text-xs">Revenue</p>
              <p className="text-green-400 font-medium text-sm">{revenueEth} ETH</p>
            </div>
            <div className="bg-gray-900/50 rounded px-2 py-1">
              <p className="text-gray-500 text-xs">Sales</p>
              <p className="text-base-blue font-medium text-sm">{unlockCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Registration Section ============

function RegistrationSection() {
  const { isRegistered, isLoading: isLoadingCreator } = useCreator();
  const { register, isPending, isConfirming, isSuccess, error } = useRegisterCreator();

  if (isLoadingCreator) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-3/4" />
      </div>
    );
  }

  if (isRegistered) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
      <h4 className="text-lg font-semibold text-white mb-2">Become a Seller</h4>
      <p className="text-gray-400 text-sm mb-4">
        Register to start selling digital products. One-time registration, no upfront fees.
        You only pay a small platform fee when you make a sale.
      </p>
      <ul className="text-gray-400 text-sm mb-4 space-y-1">
        <li>✅ Sell unlimited products</li>
        <li>✅ Get paid instantly in ETH</li>
        <li>✅ Low platform fee (2.5%)</li>
        <li>✅ No chargebacks or disputes</li>
      </ul>
      <button
        onClick={register}
        disabled={isPending || isConfirming}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Registering...'}</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>Start Selling</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
      )}
      {isSuccess && (
        <p className="text-green-400 text-sm mt-2 text-center">✅ You're now a verified seller!</p>
      )}
    </div>
  );
}

// ============ Product Categories ============

const PRODUCT_CATEGORIES = [
  { value: 'template', label: '📄 Template', description: 'Design templates, code templates' },
  { value: 'asset', label: '🎨 Asset Pack', description: 'Icons, illustrations, 3D models' },
  { value: 'course', label: '🎓 Course', description: 'Video courses, tutorials' },
  { value: 'ebook', label: '📚 eBook', description: 'PDF books, guides, documentation' },
  { value: 'software', label: '💻 Software', description: 'Tools, plugins, scripts' },
  { value: 'audio', label: '🎵 Audio', description: 'Music, sound effects, podcasts' },
  { value: 'other', label: '📦 Other', description: 'Other digital products' },
];

// ============ Create Product Form ============

function CreateContentForm() {
  const [price, setPrice] = useState('0.001');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('template');
  const [productFile, setProductFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [productUrl, setProductUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const { createContent, isPending, isConfirming, isSuccess, hash, error } = useCreateContent();
  const { getTransactionUrl } = useExplorer();

  // Handle thumbnail preview
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle product file
  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductFile(file);
    }
  };

  // Upload files to IPFS (or localStorage for demo)
  const uploadFiles = async (contentId: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let thumbnailCID = '';
      let productFileCID = '';

      // Check if IPFS is configured
      const useIPFS = isIPFSConfigured();

      if (useIPFS) {
        // Upload thumbnail to IPFS
        if (thumbnailFile) {
          setUploadProgress(20);
          const thumbnailResult = await uploadToIPFS(thumbnailFile, `thumbnail-${contentId}`);
          if (thumbnailResult.success && thumbnailResult.cid) {
            thumbnailCID = thumbnailResult.cid;
          }
        }

        // Upload product file to IPFS
        if (productFile) {
          setUploadProgress(50);
          const productResult = await uploadToIPFS(productFile, `product-${contentId}`);
          if (productResult.success && productResult.cid) {
            productFileCID = productResult.cid;
          }
        }

        setUploadProgress(80);

        // Create and upload metadata to IPFS
        const metadata: ProductMetadata = {
          title,
          description,
          category,
          price,
          thumbnailCID,
          productFileCID,
          productFileName: productFile?.name || '',
          creatorAddress: '', // Will be set by contract
          contentId,
          createdAt: new Date().toISOString(),
        };

        const metadataResult = await uploadMetadataToIPFS(metadata);
        if (metadataResult.success) {
          setProductUrl(metadataResult.url || '');
          setThumbnailUrl(thumbnailCID ? `ipfs://${thumbnailCID}` : '');
        }
      } else {
        // Demo mode: use localStorage
        for (let i = 0; i <= 80; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setUploadProgress(i);
        }

        const metadata: ProductMetadata = {
          title,
          description,
          category,
          price,
          thumbnailCID: thumbnailPreview || '', // Use base64 for demo
          productFileName: productFile?.name || '',
          creatorAddress: '',
          contentId,
          createdAt: new Date().toISOString(),
        };

        // Store in localStorage
        storeProductLocal(contentId, metadata);
        setProductUrl(`local://${contentId}`);
        setThumbnailUrl(thumbnailPreview || '');
      }
      
      setUploadProgress(100);
      return true;
    } catch (err) {
      console.error('Upload failed:', err);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !title) return;

    // Get next content ID for metadata storage
    const nextId = Date.now().toString(); // Temporary ID, will be updated after creation

    // Upload files first if provided
    if (productFile || thumbnailFile) {
      const uploaded = await uploadFiles(nextId);
      if (!uploaded) return;
    }

    // Create on-chain content entry
    createContent(price);
  };

  const isFormValid = title && price && parseFloat(price) >= 0.0001;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
        <span>🛍️</span>
        Create New Product
      </h4>

      {/* Product Title */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Product Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
          placeholder="e.g., Premium React Component Kit"
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue resize-none"
          placeholder="Describe your product..."
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
        >
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Thumbnail Upload */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Product Thumbnail</label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="text-2xl mb-2">🖼️</span>
                <p className="text-sm text-gray-400">
                  {thumbnailFile ? thumbnailFile.name : 'Click to upload thumbnail'}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </label>
          </div>
          {thumbnailPreview && (
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-700">
              <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Product File Upload */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Product File *</label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <span className="text-2xl mb-2">📁</span>
            <p className="text-sm text-gray-400">
              {productFile ? (
                <span className="text-green-400">✓ {productFile.name} ({(productFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              ) : (
                'Click to upload product file'
              )}
            </p>
            <p className="text-xs text-gray-500">ZIP, PDF, or any file up to 100MB</p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleProductFileChange}
          />
        </label>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Price (ETH) *</label>
        <input
          type="number"
          step="0.0001"
          min="0.0001"
          max="10"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
          placeholder="0.001"
        />
        <p className="text-xs text-gray-500 mt-1">Min: 0.0001 ETH (~$0.25) • Max: 10 ETH</p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Uploading files...</span>
            <span className="text-sm text-base-blue">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-base-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || isConfirming || isUploading || !isFormValid}
        className="btn btn-primary w-full"
      >
        {isUploading ? (
          <>
            <LoadingSpinner />
            <span>Uploading...</span>
          </>
        ) : isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Creating...'}</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>Publish Product</span>
          </>
        )}
      </button>

      {/* Success Message */}
      {isSuccess && hash && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm text-center">
            ✅ Product published successfully!{' '}
            <a href={getTransactionUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
              View transaction
            </a>
          </p>
          <p className="text-gray-400 text-xs text-center mt-1">
            Your product is now available for purchase
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}
    </form>
  );
}

// ============ Update Content Form ============

function UpdateContentForm() {
  const [contentId, setContentId] = useState('1');
  const [price, setPrice] = useState('');
  const [enabled, setEnabled] = useState(true);
  const { updateContent, isPending, isConfirming, isSuccess, hash, error } = useUpdateContent();
  const { getTransactionUrl } = useExplorer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId) return;
    updateContent(BigInt(contentId), price, enabled);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Update Content</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Content ID</label>
          <input
            type="number"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
            placeholder="1"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">New Price (ETH)</label>
          <input
            type="number"
            step="0.0001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-base-blue"
            placeholder="Leave empty to keep"
          />
        </div>
      </div>
      <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4">
        <span className="text-white">Content Enabled</span>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="btn w-full"
      >
        {isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Updating...'}</span>
          </>
        ) : (
          <>
            <span>✏️</span>
            <span>Update Content</span>
          </>
        )}
      </button>
      {isSuccess && hash && (
        <div className="text-green-400 text-sm text-center">
          ✅ Content updated!{' '}
          <a href={getTransactionUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
            View tx
          </a>
        </div>
      )}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </form>
  );
}

// ============ Withdraw Section ============

function WithdrawSection() {
  const { balance, balanceEth } = useCreator();
  const { withdraw, isPending, isConfirming, isSuccess, hash, error } = useCreatorWithdraw();
  const { getTransactionUrl } = useExplorer();

  const handleWithdraw = () => {
    withdraw();
  };

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/30">
      <h4 className="text-lg font-semibold text-white mb-4">Withdraw Earnings</h4>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400">Available Balance</span>
        <span className="text-2xl font-bold text-green-400">{balanceEth} ETH</span>
      </div>
      <button
        onClick={handleWithdraw}
        disabled={isPending || isConfirming || balance === BigInt(0)}
        className="btn btn-primary w-full"
      >
        {isPending || isConfirming ? (
          <>
            <LoadingSpinner />
            <span>{isPending ? 'Confirm in Wallet' : 'Withdrawing...'}</span>
          </>
        ) : (
          <>
            <span>💰</span>
            <span>Withdraw All</span>
          </>
        )}
      </button>
      {isSuccess && hash && (
        <div className="text-green-400 text-sm text-center mt-4">
          ✅ Withdrawal successful!{' '}
          <a href={getTransactionUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
            View tx
          </a>
        </div>
      )}
      {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
    </div>
  );
}

// ============ Creator Content List ============

function CreatorContentList() {
  const { contentIds, isLoading } = useCreatorContents();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-6 bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (contentIds.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
        <p className="text-gray-400">No content created yet</p>
        <p className="text-gray-500 text-sm mt-1">Create your first paywalled content above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {contentIds.map((contentId) => (
        <ContentStatsCard key={contentId.toString()} contentId={contentId} />
      ))}
    </div>
  );
}

// ============ Creator Stats Overview ============

function CreatorStatsOverview() {
  const { contentCount, totalRevenueEth, balanceEth } = useCreator();
  const { feePercent } = usePlatformFee();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs">Products</p>
        <p className="text-2xl font-bold text-white">{contentCount}</p>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs">Total Sales</p>
        <p className="text-2xl font-bold text-green-400">{totalRevenueEth} ETH</p>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs">Available</p>
        <p className="text-2xl font-bold text-blue-400">{balanceEth} ETH</p>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs">Platform Fee</p>
        <p className="text-2xl font-bold text-gray-400">{feePercent}%</p>
      </div>
    </div>
  );
}

// ============ Main Creator Dashboard ============

export function CreatorDashboardV2() {
  const { isConnected } = useAccount();
  const { isRegistered, isLoading } = useCreator();

  if (!isConnected) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🛍️</span>
          <h3 className="text-xl font-bold text-white mb-2">Seller Dashboard</h3>
          <p className="text-gray-400">Connect your wallet to start selling digital products</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner />
          <span className="text-gray-400">Loading seller data...</span>
        </div>
      </div>
    );
  }

  // Show registration if not a creator yet
  if (!isRegistered) {
    return (
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">🛍️</span>
          <h3 className="text-2xl font-bold text-white">Seller Dashboard</h3>
        </div>
        <RegistrationSection />
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">🛍️</span>
        <h3 className="text-2xl font-bold text-white">Seller Dashboard</h3>
        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">Verified Seller</span>
      </div>

      {/* Stats Overview */}
      <CreatorStatsOverview />

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Create & Update */}
        <div className="space-y-8">
          <CreateContentForm />
          <UpdateContentForm />
        </div>

        {/* Right Column - Withdraw & Product List */}
        <div className="space-y-8">
          <WithdrawSection />
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Your Products</h4>
            <CreatorContentList />
          </div>
        </div>
      </div>
    </div>
  );
}
