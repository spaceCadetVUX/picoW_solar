import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { auth } from "../firebaseConfig"; // Firebase Auth
import { signOut } from "firebase/auth"; // Import signOut
import { getDatabase, ref, onValue, set } from "firebase/database";

import app from "../firebaseConfig";

const EditProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState("Lonnie Murphy");
  const [email, setEmail] = useState("lonnie.murphy@gmail.com");
  const [phone, setPhone] = useState("(269)-748-9882");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("10/4/1977");

  const [userEmail, setUserEmail] = useState("");

  const [userAvt, setUserAvt] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const db = getDatabase(app);
    const userAvtRef = ref(db, "main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/User/userAvt");
  
    onValue(userAvtRef, (snapshot) => {
      const avatarUrl = snapshot.val();
      if (avatarUrl) {
        setUserAvt(avatarUrl);
        setNewUrl(avatarUrl); // Ensure newUrl is set when data is loaded
      }
      setLoading(false);
    });
  }, []);
  
  

  const updateUserAvatar = () => {
    if (!newUrl.trim()) return;
  
    const db = getDatabase(app);
    const userAvtRef = ref(db, "main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/User/userAvt");
  
    set(userAvtRef, newUrl)
      .then(() => {
        console.log("User Avatar Updated!");
        setUserAvt(newUrl);  // Update UI immediately
        setNewUrl(newUrl);    // Ensure TextInput also updates
      })
      .catch((error) => {
        console.error("Error updating avatar:", error);
      });
  };
  

  
  useEffect(() => {
      const currentUser = auth.currentUser; // Get currently signed-in user
      if (currentUser) {
        setUserEmail(currentUser.email); // Set user email
      }
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={updateUserAvatar}>
          <Text style={styles.saveText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Image */}
      <View style={styles.profileContainer}>
      <Image
          source={{ uri: userAvt }} 
          style={styles.profileImage}
        />


      </View>

      {/* Profile Info Fields */}
      <View style={styles.infoContainer}>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={userEmail}
          editable={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          value={newUrl}  // Show current image URL (userAvt)
          placeholder="Enter new avatar URL"
          onChangeText={(text) => setNewUrl(text)} // Allow changes
        />


        <Text style={styles.label}>Cloud ID</Text>
        <TextInput
          style={styles.input}
    
          onChangeText={setGender}
        />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={dob}
          onChangeText={setDob}
        />

      {loading ? (
        <ActivityIndicator size="large" color="#002147" />
      ) : (
        <Image source={{ uri: userAvt }} style={styles.avatar} />
      )}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
 //   alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#2a2be8",
    height:200,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  
    // Shadow for Android
    elevation: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
  },
  profileContainer: {
    alignItems: "center",
    position:'absolute',
    width:"100%",
    height:200,
    marginTop:20,
    justifyContent:'center'
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "red",
    borderRadius: 20,
    padding: 6,
  },
  infoContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
    paddingVertical: 5,
    marginBottom: 15,
  },
});

export default EditProfileScreen;
