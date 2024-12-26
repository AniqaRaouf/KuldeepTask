import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const App = () => {
  const [memberDetails, setMemberDetails] = useState(null);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState([]); // State to track expanded rows
  const [expandedData, setExpandedData] = useState({}); // To store fetched data for each expanded row

  const fetchMemberDetails = () => {
    console.log("Fetching data...");

    fetch('https://dev-server.valuebet.app/user/get-main-affi-member-details', {
      method: 'GET',
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM4NTE1MzIxLCJpYXQiOjE3MzUwNTkzMjEsImp0aSI6ImFiZmU1ZDM0MzY2ODRjNDJhYWY3Nzg2YzgxYWQ1ZTVlIiwidXNlcl9pZCI6IjIzNmE3MzM5In0.BMwMN_eVlym1xfDbZAhfgBRJUShQf-Pjr83E0zBu_JQ`,
      },
    })
      .then((response) => {
        console.log('Response Status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Data:', data);
        setMemberDetails(data); // Set the fetched data
      })
      .catch((err) => {
        console.error('Error:', err.message || 'An unknown error occurred');
        setError(err.message || 'An unknown error occurred');
      });
  };

  useEffect(() => {
    fetchMemberDetails();
  }, []);


  const fetchMemberDetailsByID = async (id) => {
    try {
      const response = await fetch(
        `https://dev-server.valuebet.app/user/get-main-affi-member-details?affiliate_id=${id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM4NTE1MzIxLCJpYXQiOjE3MzUwNTkzMjEsImp0aSI6ImFiZmU1ZDM0MzY2ODRjNDJhYWY3Nzg2YzgxYWQ1ZTVlIiwidXNlcl9pZCI6IjIzNmE3MzM5In0.BMwMN_eVlym1xfDbZAhfgBRJUShQf-Pjr83E0zBu_JQ`,
          },
        }
      );
      console.log("response fetchMemberDetailsByID", response)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExpandedData((prev) => ({ ...prev, [id]: data.affiliate_details }));
    } catch (error) {
      console.error('Error fetching details:', error.message || 'Unknown error');
    }
  };



  const renderRow = ({ item, index }, level = 0) => {
    const isExpanded = expandedRows.includes(item.user_id);
    const affiliateDetails = expandedData[item.user_id] || [];

    const handleToggle = () => {
      setExpandedRows((prev) =>
        prev.includes(item.user_id)
          ? prev.filter((row) => row !== item.user_id)
          : [...prev, item.user_id]
      );

      if (!expandedData[item.user_id]) {
        fetchMemberDetailsByID(item.user_id); // Fetch data only if not already fetched
      }
    };

    // Define background colors for each level
    const rowBackgroundColors = [
      'rgba(253, 79, 63, 0.51)', // Level 0
      'rgba(191, 97, 88, 0.72)', // Level 1
      'rgba(159, 115, 111, 0.62)', // Level 2
      'rgb(66, 66, 66)', // Level 3
      'rgba(0, 0, 0, 0.48)', // Level 4
    ];

    return (
      <View>
        {/* Main Row */}
        <View
          style={[
            styles.row,
            {
              paddingLeft: level * 20, // Indent based on nesting level
              marginLeft: level > 0 ? 10 : 0, // Additional margin for children
              paddingRight: level > 0 ? 10 : 0, // Reduce width for children
              backgroundColor: rowBackgroundColors[level] || 'rgba(0, 0, 0, 0.5)', // Default color if level exceeds defined colors
            },
          ]}
        >
          {level < 4 ? ( // Only show toggle icon if nesting level is less than 4
            <TouchableOpacity onPress={handleToggle} style={{ padding: 3 }}>
              {level === 0 ? (
                <Icon
                  name={isExpanded ? 'chevron-down-outline' : 'chevron-forward-outline'}
                  color={"#fff"}
                  size={18}
                />
              ) : (
                <AntDesign name={isExpanded ? 'minus' : 'plus'} size={18} color={"#fff"} />
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ width: 20 }} /> // Placeholder for alignment
          )}
          <Text style={styles.cell}>{item.username}</Text>
          <Text style={styles.cell}>{item.total_referrals}</Text>
          <Text style={styles.cell}>{item.coins_bought_by_affiliates}</Text>
          <Text style={styles.cell}>{item.coins_spent_by_affiliates}</Text>
          <Text style={styles.cell}>{item.coins_awarded_to_affiliates}</Text>
          <Text style={styles.cell}>{item.coins_user_bought}</Text>
        </View>

        {/* Expanded Section */}
        {isExpanded && (
          <View style={styles.expandedRow}>
            {affiliateDetails.length > 0 ? (
              <FlatList
                data={affiliateDetails}
                renderItem={(childItem) => renderRow(childItem, level + 1)} // Pass the updated level
                keyExtractor={(childItem) => childItem.user_id.toString()}
              />
            ) : (
              <Text style={{ color: '#fff', alignSelf: 'center' }}>There are no records to display</Text>
            )}
          </View>
        )}
      </View>
    );
  };





  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" /> */}
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.section}>
          <Text style={styles.title}>Main Affiliate Member Details</Text>
          {error ? (
            <Text style={styles.error}>Error: {error}</Text>
          ) : memberDetails ? (
            <>
              <View style={{ backgroundColor: 'rgb(0, 128, 0)', paddingVertical: 5 }}>
                <View style={styles.headerRow}>
                  <Text style={styles.headerCell}>Username</Text>
                  <Text style={styles.headerCell}>Total Referrals</Text>
                  <Text style={styles.headerCell}>Coins Bought</Text>
                  <Text style={styles.headerCell}>Coins Spent</Text>
                  <Text style={styles.headerCell}>Coins Awarded</Text>
                  <Text style={styles.headerCell}>Coins User Bought</Text>
                </View>
                <View style={styles.footerRow}>
                  <Text style={styles.footerCell}>Tier 1</Text>
                  <Text style={styles.footerCell}>
                    {memberDetails.total.total_referrals}
                  </Text>
                  <Text style={styles.footerCell}>
                    {memberDetails.total.coins_bought_by_affiliates}
                  </Text>
                  <Text style={styles.footerCell}>
                    {memberDetails.total.coins_spent_by_affiliates}
                  </Text>
                  <Text style={styles.footerCell}>
                    {memberDetails.total.coins_awarded_to_affiliates}
                  </Text>
                  <Text style={styles.footerCell}>
                    {memberDetails.total.coins_user_bought}
                  </Text>
                </View>
              </View>
              <FlatList
                data={memberDetails.affiliate_details}
                renderItem={renderRow}
                keyExtractor={(item) => item.username}
              />
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  section: {
    marginHorizontal: 0,
    paddingHorizontal: 5,
    paddingVertical: 20,
    backgroundColor: '#000',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    alignSelf: 'center'
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'rgb(0, 128, 0)',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'rgba(253, 79, 63, 0.51)',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'rgb(81, 81, 81)',
  },
  footerRow: {
    flexDirection: 'row',
    backgroundColor: '#f1c40f',
    padding: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    fontSize: 12,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
  },
  footerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  error: {
    fontSize: 14,
    color: 'red',
  },
  expandedRow: {
    backgroundColor: '#000',
    // padding: 10,
    paddingVertical: 10
  },
  expandedCell: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
});

export default App;
