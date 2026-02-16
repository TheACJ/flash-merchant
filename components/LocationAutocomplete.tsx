import { borderRadius, colors, layout, typography } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Location {
  address: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onLocationSelect,
  placeholder = 'Search for location...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLocationSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Mock location suggestions - in a real app, this would call a location API
      const mockSuggestions: Location[] = [
        {
          address: '123 Main St, Lagos, Nigeria',
          state: 'Lagos',
          latitude: 6.5244,
          longitude: 3.3792,
        },
        {
          address: '456 Broad St, Abuja, Nigeria',
          state: 'Abuja',
          latitude: 9.0765,
          longitude: 7.3986,
        },
        {
          address: '789 High St, Port Harcourt, Nigeria',
          state: 'Rivers',
          latitude: 4.8149,
          longitude: 7.0498,
        },
      ];

      // Filter suggestions based on query
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.address.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.state.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions(filtered);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch location suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      fetchLocationSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSuggestionSelect = (location: Location) => {
    onLocationSelect(location);
    setSearchQuery(location.address);
    setSuggestions([]);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {loading && (
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <ScrollView
          style={styles.suggestionsList}
          contentContainerStyle={styles.suggestionsContent}
          showsVerticalScrollIndicator={false}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionSelect(suggestion)}
              activeOpacity={0.8}
            >
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionAddress}>{suggestion.address}</Text>
                <Text style={styles.suggestionState}>{suggestion.state}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    height: layout.inputHeight,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    height: '100%',
  },
  loadingIndicator: {
    paddingHorizontal: 10,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPlaceholder,
  },
  suggestionsList: {
    position: 'absolute',
    top: layout.inputHeight,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundInput,
    marginBottom: 4,
  },
  suggestionContent: {
    padding: 8,
  },
  suggestionAddress: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  suggestionState: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});

export default LocationAutocomplete;