import { StyleSheet,Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
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
      },
      warning: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
      },
      passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingRight: 8,
        marginBottom: 12,
      },
})