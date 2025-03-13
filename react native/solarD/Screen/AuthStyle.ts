import { StyleSheet,Dimensions } from 'react-native';
import { Button } from 'react-native-paper';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default StyleSheet.create({
    authBackground: {
        width: windowWidth, 
        height: windowHeight * 0.3, 
        resizeMode:'contain',  
        position:'absolute',
        top:-24,
    },
    containerAnimated:{
        flex:1,
        width:"100%",
        // /justifyContent:'center',
        alignItems:'center',

    },

    containerKey:{
        height:"100%",
    },
    logoAuth:{
        width:windowWidth*3,
        height:windowHeight*0.27,
        resizeMode:'contain',
        marginTop:150,
      
    },
      safeArea: {
      flex: 1,
      backgroundColor: "#ffff",
    },

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center', 
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: 'black',
      },
      input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        width:'90%',
        height:50
      },
      warning: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
      },
      passwordContainer: {
        width:'90%',
        height:50,
        justifyContent:'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingRight: 8,
        marginBottom: 12,
        
      },

      Button:{
        backgroundColor: '#2928e8',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        width:'50%'
      },
      buttonText:{
        fontSize:18,
        fontWeight:'bold',
        color:'white'
      },
})