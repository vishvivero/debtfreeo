
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ImageUploadButton } from '../ImageUploadButton';
import { supabase } from '@/integrations/supabase/client';
import { BrowserRouter } from 'react-router-dom';
import { uploadImageToStorage } from '@/integrations/supabase/storageUtils';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-image.jpg' }, error: null }),
    },
  },
}));

// Mock the uploadImageToStorage function
vi.mock('@/integrations/supabase/storageUtils', () => ({
  uploadImageToStorage: vi.fn().mockResolvedValue('test-image.jpg'),
  getStorageUrl: vi.fn().mockReturnValue('https://example.com/test-image.jpg'),
}));

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('ImageUploadButton', () => {
  const mockProps = {
    blogId: 'test-blog-id',
    isAdmin: true,
    refreshBlog: vi.fn(),
  };

  it('should not render when user is not admin', () => {
    render(
      <BrowserRouter>
        <ImageUploadButton {...mockProps} isAdmin={false} />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Update Image')).not.toBeInTheDocument();
  });

  it('should render when user is admin', () => {
    render(
      <BrowserRouter>
        <ImageUploadButton {...mockProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Update Image')).toBeInTheDocument();
  });

  it('should open file input when clicked', () => {
    render(
      <BrowserRouter>
        <ImageUploadButton {...mockProps} />
      </BrowserRouter>
    );
    
    const button = screen.getByText('Update Image');
    const fileInput = screen.getByTestId('image-upload-input');
    
    // Mock the click event
    const clickEvent = { click: vi.fn() };
    Object.defineProperty(fileInput, 'click', {
      value: clickEvent.click,
    });
    
    fireEvent.click(button);
    expect(clickEvent.click).toHaveBeenCalledTimes(1);
  });

  it('should upload file and update blog when file selected', async () => {
    render(
      <BrowserRouter>
        <ImageUploadButton {...mockProps} />
      </BrowserRouter>
    );
    
    const fileInput = screen.getByTestId('image-upload-input');
    const file = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(uploadImageToStorage).toHaveBeenCalledWith('blog-images', file);
      expect(supabase.from).toHaveBeenCalledWith('blogs');
      expect(mockProps.refreshBlog).toHaveBeenCalled();
    });
  });
});
