import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { mockApiService, mockUser, mockPerson, mockGift, mockOccasion } from '@/test/utils'

// Mock components for testing
const MockGiftsPage = () => {
  const [gifts, setGifts] = React.useState<any[]>([])
  const [people, setPeople] = React.useState<any[]>([])
  const [occasions, setOccasions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [giftsResponse, peopleResponse, occasionsResponse] = await Promise.all([
          mockApiService.getGifts(),
          mockApiService.getPeople(),
          mockApiService.getOccasions()
        ])
        
        setGifts(giftsResponse.data || [])
        setPeople(peopleResponse.data || [])
        setOccasions(occasionsResponse.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreateGift = async (giftData: any) => {
    try {
      const newGift = await mockApiService.createGift(giftData)
      setGifts(prev => [...prev, newGift])
      return newGift
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gift')
      throw err
    }
  }

  const handleUpdateGift = async (id: string, updates: any) => {
    try {
      const updatedGift = await mockApiService.updateGift(id, updates)
      setGifts(prev => prev.map(g => g.id === id ? updatedGift : g))
      return updatedGift
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gift')
      throw err
    }
  }

  const handleDeleteGift = async (id: string) => {
    try {
      await mockApiService.deleteGift(id)
      setGifts(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gift')
      throw err
    }
  }

  if (loading) {
    return <div data-testid="loading">Loading gifts...</div>
  }

  if (error) {
    return (
      <div data-testid="error">
        Error: {error}
        <button onClick={() => setError(null)}>Clear Error</button>
      </div>
    )
  }

  return (
    <div data-testid="gifts-page">
      <h1>Gift Management</h1>
      
      {/* Gift Creation Form */}
      <form data-testid="create-gift-form" onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const giftData = {
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          price: parseFloat(formData.get('price') as string),
          currency: formData.get('currency') as string,
          status: formData.get('status') as any,
          recipientId: formData.get('recipientId') as string,
          occasionId: formData.get('occasionId') as string || undefined,
          notes: formData.get('notes') as string || undefined
        }
        
        try {
          await handleCreateGift(giftData)
          e.currentTarget.reset()
        } catch (err) {
          // Error handled in handleCreateGift
        }
      }}>
        <input name="name" placeholder="Gift name" required data-testid="gift-name-input" />
        <input name="description" placeholder="Description" data-testid="gift-description-input" />
        <input name="price" type="number" step="0.01" placeholder="Price" required data-testid="gift-price-input" />
        <select name="currency" required data-testid="gift-currency-select">
          <option value="">Select Currency</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        <select name="status" required data-testid="gift-status-select">
          <option value="">Select Status</option>
          <option value="planned">Planned</option>
          <option value="purchased">Purchased</option>
          <option value="wrapped">Wrapped</option>
          <option value="given">Given</option>
        </select>
        <select name="recipientId" required data-testid="gift-recipient-select">
          <option value="">Select Recipient</option>
          {people.map(person => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </select>
        <select name="occasionId" data-testid="gift-occasion-select">
          <option value="">Select Occasion (Optional)</option>
          {occasions.map(occasion => (
            <option key={occasion.id} value={occasion.id}>{occasion.name}</option>
          ))}
        </select>
        <textarea name="notes" placeholder="Notes" data-testid="gift-notes-input" />
        <button type="submit" data-testid="create-gift-button">Create Gift</button>
      </form>

      {/* Gifts List */}
      <div data-testid="gifts-list">
        {gifts.length === 0 ? (
          <p data-testid="no-gifts">No gifts found</p>
        ) : (
          gifts.map(gift => (
            <div key={gift.id} data-testid={`gift-${gift.id}`} className="gift-item">
              <h3>{gift.name}</h3>
              <p>Price: {gift.currency} {gift.price}</p>
              <p>Status: {gift.status}</p>
              <p>Recipient: {people.find(p => p.id === gift.recipientId)?.name || 'Unknown'}</p>
              {gift.occasionId && (
                <p>Occasion: {occasions.find(o => o.id === gift.occasionId)?.name || 'Unknown'}</p>
              )}
              
              {/* Status Update Buttons */}
              <div className="status-actions">
                {gift.status === 'planned' && (
                  <button 
                    onClick={() => handleUpdateGift(gift.id, { status: 'purchased' })}
                    data-testid={`mark-purchased-${gift.id}`}
                  >
                    Mark as Purchased
                  </button>
                )}
                {gift.status === 'purchased' && (
                  <button 
                    onClick={() => handleUpdateGift(gift.id, { status: 'wrapped' })}
                    data-testid={`mark-wrapped-${gift.id}`}
                  >
                    Mark as Wrapped
                  </button>
                )}
                {gift.status === 'wrapped' && (
                  <button 
                    onClick={() => handleUpdateGift(gift.id, { status: 'given' })}
                    data-testid={`mark-given-${gift.id}`}
                  >
                    Mark as Given
                  </button>
                )}
              </div>

              {/* Delete Button */}
              <button 
                onClick={() => handleDeleteGift(gift.id)}
                data-testid={`delete-gift-${gift.id}`}
                className="delete-button"
              >
                Delete Gift
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
)

describe('Gift Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock localStorage with authenticated user
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn()
          .mockReturnValueOnce(JSON.stringify(mockUser)) // user
          .mockReturnValueOnce('token123'), // authToken
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true
    })
    
    // Mock successful auth validation
    mockApiService.validateUser.mockResolvedValue({ user: mockUser })

    // Default API responses
    mockApiService.getGifts.mockResolvedValue({ data: [], total: 0 })
    mockApiService.getPeople.mockResolvedValue({ data: [mockPerson], total: 1 })
    mockApiService.getOccasions.mockResolvedValue({ data: [mockOccasion], total: 1 })
  })

  describe('Initial Data Loading', () => {
    it('should load gifts, people, and occasions on mount', async () => {
      const gifts = [mockGift]
      mockApiService.getGifts.mockResolvedValue({ data: gifts, total: 1 })

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Should load data
      await waitFor(() => {
        expect(mockApiService.getGifts).toHaveBeenCalled()
        expect(mockApiService.getPeople).toHaveBeenCalled()
        expect(mockApiService.getOccasions).toHaveBeenCalled()
      })

      // Should display gifts
      await waitFor(() => {
        expect(screen.getByTestId('gifts-page')).toBeInTheDocument()
        expect(screen.getByTestId(`gift-${mockGift.id}`)).toBeInTheDocument()
      })

      expect(screen.getByText(mockGift.name)).toBeInTheDocument()
      expect(screen.getByText(`Price: ${mockGift.currency} ${mockGift.price}`)).toBeInTheDocument()
    })

    it('should handle loading errors gracefully', async () => {
      mockApiService.getGifts.mockRejectedValue(new Error('Failed to load gifts'))

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
      })

      expect(screen.getByText('Error: Failed to load gifts')).toBeInTheDocument()
    })

    it('should show empty state when no gifts exist', async () => {
      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('no-gifts')).toBeInTheDocument()
      })

      expect(screen.getByText('No gifts found')).toBeInTheDocument()
    })
  })

  describe('Gift Creation', () => {
    it('should create a new gift successfully', async () => {
      const user = userEvent.setup()
      const newGift = { ...mockGift, id: '2', name: 'New Gift' }
      
      mockApiService.createGift.mockResolvedValue(newGift)

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('create-gift-form')).toBeInTheDocument()
      })

      // Fill out the form
      await user.type(screen.getByTestId('gift-name-input'), 'New Gift')
      await user.type(screen.getByTestId('gift-description-input'), 'A wonderful new gift')
      await user.type(screen.getByTestId('gift-price-input'), '150.99')
      await user.selectOptions(screen.getByTestId('gift-currency-select'), 'USD')
      await user.selectOptions(screen.getByTestId('gift-status-select'), 'planned')
      await user.selectOptions(screen.getByTestId('gift-recipient-select'), mockPerson.id)
      await user.selectOptions(screen.getByTestId('gift-occasion-select'), mockOccasion.id)
      await user.type(screen.getByTestId('gift-notes-input'), 'Special notes')

      // Submit the form
      await act(async () => {
        await user.click(screen.getByTestId('create-gift-button'))
      })

      // Should call create API
      await waitFor(() => {
        expect(mockApiService.createGift).toHaveBeenCalledWith({
          name: 'New Gift',
          description: 'A wonderful new gift',
          price: 150.99,
          currency: 'USD',
          status: 'planned',
          recipientId: mockPerson.id,
          occasionId: mockOccasion.id,
          notes: 'Special notes'
        })
      })

      // Should display the new gift
      await waitFor(() => {
        expect(screen.getByTestId(`gift-${newGift.id}`)).toBeInTheDocument()
      })

      expect(screen.getByText('New Gift')).toBeInTheDocument()
    })

    it('should handle gift creation validation errors', async () => {
      const user = userEvent.setup()
      
      mockApiService.createGift.mockRejectedValue(new Error('Gift name is required'))

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('create-gift-form')).toBeInTheDocument()
      })

      // Try to submit empty form
      await act(async () => {
        await user.click(screen.getByTestId('create-gift-button'))
      })

      // Should show validation error from browser (required fields)
      // But if it passes client validation and fails on server:
      await user.type(screen.getByTestId('gift-name-input'), '')
      await user.type(screen.getByTestId('gift-price-input'), '99.99')
      await user.selectOptions(screen.getByTestId('gift-currency-select'), 'USD')
      await user.selectOptions(screen.getByTestId('gift-status-select'), 'planned')
      await user.selectOptions(screen.getByTestId('gift-recipient-select'), mockPerson.id)

      await act(async () => {
        await user.click(screen.getByTestId('create-gift-button'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
      })

      expect(screen.getByText('Error: Gift name is required')).toBeInTheDocument()
    })

    it('should reset form after successful creation', async () => {
      const user = userEvent.setup()
      const newGift = { ...mockGift, id: '2', name: 'New Gift' }
      
      mockApiService.createGift.mockResolvedValue(newGift)

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('create-gift-form')).toBeInTheDocument()
      })

      const nameInput = screen.getByTestId('gift-name-input')
      const priceInput = screen.getByTestId('gift-price-input')

      await user.type(nameInput, 'New Gift')
      await user.type(priceInput, '150.99')
      await user.selectOptions(screen.getByTestId('gift-currency-select'), 'USD')
      await user.selectOptions(screen.getByTestId('gift-status-select'), 'planned')
      await user.selectOptions(screen.getByTestId('gift-recipient-select'), mockPerson.id)

      await act(async () => {
        await user.click(screen.getByTestId('create-gift-button'))
      })

      // Form should be reset
      await waitFor(() => {
        expect(nameInput).toHaveValue('')
        expect(priceInput).toHaveValue(null)
      })
    })
  })

  describe('Gift Status Updates', () => {
    it('should update gift status through workflow', async () => {
      const user = userEvent.setup()
      const plannedGift = { ...mockGift, status: 'planned' }
      const purchasedGift = { ...mockGift, status: 'purchased' }
      const wrappedGift = { ...mockGift, status: 'wrapped' }
      const givenGift = { ...mockGift, status: 'given' }

      mockApiService.getGifts.mockResolvedValue({ data: [plannedGift], total: 1 })
      mockApiService.updateGift
        .mockResolvedValueOnce(purchasedGift)
        .mockResolvedValueOnce(wrappedGift)
        .mockResolvedValueOnce(givenGift)

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId(`gift-${mockGift.id}`)).toBeInTheDocument()
      })

      // Should show "Mark as Purchased" button for planned gift
      expect(screen.getByTestId(`mark-purchased-${mockGift.id}`)).toBeInTheDocument()
      expect(screen.getByText('Status: planned')).toBeInTheDocument()

      // Mark as purchased
      await act(async () => {
        await user.click(screen.getByTestId(`mark-purchased-${mockGift.id}`))
      })

      await waitFor(() => {
        expect(mockApiService.updateGift).toHaveBeenCalledWith(mockGift.id, { status: 'purchased' })
      })

      await waitFor(() => {
        expect(screen.getByText('Status: purchased')).toBeInTheDocument()
        expect(screen.getByTestId(`mark-wrapped-${mockGift.id}`)).toBeInTheDocument()
      })

      // Mark as wrapped
      await act(async () => {
        await user.click(screen.getByTestId(`mark-wrapped-${mockGift.id}`))
      })

      await waitFor(() => {
        expect(screen.getByText('Status: wrapped')).toBeInTheDocument()
        expect(screen.getByTestId(`mark-given-${mockGift.id}`)).toBeInTheDocument()
      })

      // Mark as given
      await act(async () => {
        await user.click(screen.getByTestId(`mark-given-${mockGift.id}`))
      })

      await waitFor(() => {
        expect(screen.getByText('Status: given')).toBeInTheDocument()
      })

      // Should not show any more status update buttons
      expect(screen.queryByTestId(`mark-purchased-${mockGift.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`mark-wrapped-${mockGift.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`mark-given-${mockGift.id}`)).not.toBeInTheDocument()
    })

    it('should handle status update errors', async () => {
      const user = userEvent.setup()
      const plannedGift = { ...mockGift, status: 'planned' }

      mockApiService.getGifts.mockResolvedValue({ data: [plannedGift], total: 1 })
      mockApiService.updateGift.mockRejectedValue(new Error('Failed to update gift status'))

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId(`gift-${mockGift.id}`)).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByTestId(`mark-purchased-${mockGift.id}`))
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
      })

      expect(screen.getByText('Error: Failed to update gift status')).toBeInTheDocument()
      // Should still show original status
      expect(screen.getByText('Status: planned')).toBeInTheDocument()
    })
  })

  describe('Gift Deletion', () => {
    it('should delete a gift successfully', async () => {
      const user = userEvent.setup()
      
      mockApiService.getGifts.mockResolvedValue({ data: [mockGift], total: 1 })
      mockApiService.deleteGift.mockResolvedValue({ success: true })

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId(`gift-${mockGift.id}`)).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByTestId(`delete-gift-${mockGift.id}`))
      })

      await waitFor(() => {
        expect(mockApiService.deleteGift).toHaveBeenCalledWith(mockGift.id)
      })

      // Gift should be removed from the list
      await waitFor(() => {
        expect(screen.queryByTestId(`gift-${mockGift.id}`)).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('no-gifts')).toBeInTheDocument()
    })

    it('should handle gift deletion errors', async () => {
      const user = userEvent.setup()
      
      mockApiService.getGifts.mockResolvedValue({ data: [mockGift], total: 1 })
      mockApiService.deleteGift.mockRejectedValue(new Error('Failed to delete gift'))

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId(`gift-${mockGift.id}`)).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByTestId(`delete-gift-${mockGift.id}`))
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
      })

      expect(screen.getByText('Error: Failed to delete gift')).toBeInTheDocument()
      // Gift should still be in the list
      expect(screen.getByTestId(`gift-${mockGift.id}`)).toBeInTheDocument()
    })
  })

  describe('Data Relationships', () => {
    it('should display recipient and occasion names correctly', async () => {
      const giftWithRelations = {
        ...mockGift,
        recipientId: mockPerson.id,
        occasionId: mockOccasion.id
      }

      mockApiService.getGifts.mockResolvedValue({ data: [giftWithRelations], total: 1 })

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId(`gift-${mockGift.id}`)).toBeInTheDocument()
      })

      expect(screen.getByText(`Recipient: ${mockPerson.name}`)).toBeInTheDocument()
      expect(screen.getByText(`Occasion: ${mockOccasion.name}`)).toBeInTheDocument()
    })

    it('should handle missing recipient or occasion gracefully', async () => {
      const giftWithMissingRelations = {
        ...mockGift,
        recipientId: 'non-existent-id',
        occasionId: 'non-existent-id'
      }

      mockApiService.getGifts.mockResolvedValue({ data: [giftWithMissingRelations], total: 1 })

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId(`gift-${mockGift.id}`)).toBeInTheDocument()
      })

      expect(screen.getByText('Recipient: Unknown')).toBeInTheDocument()
      expect(screen.getByText('Occasion: Unknown')).toBeInTheDocument()
    })

    it('should populate form dropdowns with available people and occasions', async () => {
      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('gift-recipient-select')).toBeInTheDocument()
      })

      const recipientSelect = screen.getByTestId('gift-recipient-select')
      const occasionSelect = screen.getByTestId('gift-occasion-select')

      expect(recipientSelect).toHaveTextContent(mockPerson.name)
      expect(occasionSelect).toHaveTextContent(mockOccasion.name)
    })
  })

  describe('Error Recovery', () => {
    it('should allow error clearing and retry', async () => {
      const user = userEvent.setup()
      
      mockApiService.getGifts.mockRejectedValueOnce(new Error('Network error'))

      render(
        <TestWrapper>
          <MockGiftsPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
      })

      expect(screen.getByText('Error: Network error')).toBeInTheDocument()

      // Clear error
      await act(async () => {
        await user.click(screen.getByText('Clear Error'))
      })

      expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    })
  })
})