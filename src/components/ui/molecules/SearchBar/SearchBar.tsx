import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Import components
import { Input } from '../../atoms/Input';

// Import theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '@/theme';

// Simple SearchBar Props
interface SimpleSearchBarProps {
  placeholder?: string;
  value?: string;
  variant?: 'default' | 'chinese' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showSuggestions?: boolean;
  suggestions?: string[];
  maxResults?: number;
  containerStyle?: any;
  onSearch?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
}

/**
 * Simple SearchBar Component - No Infinite Loops
 * 
 * Features:
 * - Search input with suggestions
 * - Chinese character support
 * - Responsive design
 * - Simple state management
 */
export const SearchBar: React.FC<SimpleSearchBarProps> = ({
  placeholder = 'Tìm kiếm...',
  value = '',
  variant = 'default',
  size = 'md',
  showSuggestions = true,
  suggestions = [],
  maxResults = 5,
  containerStyle,
  onSearch,
  onSearchSubmit,
  onSuggestionSelect,
  onFocus,
  onBlur,
  onClear,
}) => {
  // Simple state
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);

  // Animation values
  const suggestionsHeight = useSharedValue(0);

  // Size configuration
  const sizeConfig = {
    sm: {
      height: device.isMobile ? 36 : 40,
      fontSize: getResponsiveFontSize('sm'),
      spacing: getResponsiveSpacing('sm'),
    },
    md: {
      height: device.isMobile ? 44 : 48,
      fontSize: getResponsiveFontSize('base'),
      spacing: getResponsiveSpacing('md'),
    },
    lg: {
      height: device.isMobile ? 52 : 56,
      fontSize: getResponsiveFontSize('lg'),
      spacing: getResponsiveSpacing('lg'),
    },
  }[size];

  // Handle search input change
  const handleSearchChange = useCallback((text: string) => {
    setSearchValue(text);
    
    // Calculate filtered suggestions inside callback
    const filtered = suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(text.toLowerCase())
      )
      .slice(0, maxResults);

    setCurrentSuggestions(filtered);
    
    // Show/hide suggestions
    if (text.length > 0 && showSuggestions && filtered.length > 0) {
      setShowSuggestionsList(true);
      suggestionsHeight.value = withSpring(150, { duration: 300 });
    } else {
      setShowSuggestionsList(false);
      suggestionsHeight.value = withSpring(0, { duration: 300 });
    }

    onSearch?.(text);
  }, [suggestions, maxResults, showSuggestions, suggestionsHeight, onSearch]);

  // Handle search submit
  const handleSearchSubmit = useCallback(() => {
    if (searchValue.trim()) {
      setShowSuggestionsList(false);
      suggestionsHeight.value = withSpring(0, { duration: 300 });
      onSearchSubmit?.(searchValue.trim());
    }
  }, [searchValue, suggestionsHeight, onSearchSubmit]);

  // Handle clear
  const handleClear = useCallback(() => {
    setSearchValue('');
    setCurrentSuggestions([]);
    setShowSuggestionsList(false);
    suggestionsHeight.value = withSpring(0, { duration: 300 });
    onClear?.();
  }, [suggestionsHeight, onClear]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (searchValue.length > 0 && showSuggestions && currentSuggestions.length > 0) {
      setShowSuggestionsList(true);
      suggestionsHeight.value = withSpring(150, { duration: 300 });
    }
    onFocus?.();
  }, [searchValue, showSuggestions, currentSuggestions.length, suggestionsHeight, onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestionsList(false);
      suggestionsHeight.value = withSpring(0, { duration: 300 });
    }, 150);
    onBlur?.();
  }, [suggestionsHeight, onBlur]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchValue(suggestion);
    setShowSuggestionsList(false);
    suggestionsHeight.value = withSpring(0, { duration: 300 });
    onSuggestionSelect?.(suggestion);
  }, [suggestionsHeight, onSuggestionSelect]);

  // Animated styles
  const suggestionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: suggestionsHeight.value,
    };
  });

  // Render suggestions
  const renderSuggestions = () => {
    if (!showSuggestionsList || currentSuggestions.length === 0) return null;

    return (
      <Animated.View style={[styles.suggestionsContainer, suggestionsAnimatedStyle]}>
        <FlatList
          data={currentSuggestions}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSuggestionSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionText, { fontSize: sizeConfig.fontSize }]}>{item}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    );
  };

  // Render different variants
  const renderSearchInput = () => {
    const inputProps = {
      value: searchValue,
      placeholder: variant === 'chinese' ? '搜索中文...' : placeholder,
      onChangeText: handleSearchChange,
      onSubmitEditing: handleSearchSubmit,
      onFocus: handleFocus,
      onBlur: handleBlur,
      style: [styles.input, { height: sizeConfig.height, fontSize: sizeConfig.fontSize }],
      clearButtonMode: 'while-editing' as const,
    };

    switch (variant) {
      case 'chinese':
        return (
          <View style={styles.chineseContainer}>
            <Input {...inputProps} />
            <View style={styles.chineseIndicator}>
              <Text style={styles.chineseText}>中</Text>
            </View>
          </View>
        );

      case 'minimal':
        return (
          <View style={styles.minimalContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Input {...inputProps} />
            {searchValue.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.defaultContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Input {...inputProps} />
            {searchValue.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderSearchInput()}
      {renderSuggestions()}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: device.isMobile ? 8 : 12,
    paddingHorizontal: getResponsiveSpacing('sm'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: device.isMobile ? 6 : 8,
    paddingHorizontal: getResponsiveSpacing('xs'),
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  chineseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: device.isMobile ? 8 : 12,
    paddingHorizontal: getResponsiveSpacing('sm'),
    borderWidth: 2,
    borderColor: colors.primary[300],
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: getResponsiveSpacing('xs'),
    opacity: 0.6,
  },
  clearButton: {
    padding: getResponsiveSpacing('xs'),
  },
  clearIcon: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  chineseIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: getResponsiveSpacing('xs'),
  },
  chineseText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[50],
  },
  suggestionsContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: device.isMobile ? 8 : 12,
    marginTop: getResponsiveSpacing('xs'),
    overflow: 'hidden',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: getResponsiveSpacing('sm'),
    paddingHorizontal: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  suggestionText: {
    color: colors.neutral[700],
  },
});

export default SearchBar; 